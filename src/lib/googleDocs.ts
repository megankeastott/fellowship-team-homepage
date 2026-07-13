// ============================================================
// GOOGLE DOCS → STRUCTURED CONTENT (build-time)
// ============================================================
//
// Ports the old Apps Script parseDoc()/postProcessTags() logic so it runs
// during the Netlify build against PUBLISHED Google Docs (no Google access
// needed at request time).
//
// Doc conventions (see EDITING-GUIDE.md):
//   Heading 1  → section       (optional trailing [icon], e.g. "News [candle]")
//   Heading 2  → card title    (optional [color] and/or [full], e.g. "Rates [shire, full]")
//   Heading 3  → subheading inside a card
//   normal text, bold, italic, links, bullet & numbered lists
//   [callout color] ... [/callout]   → highlighted box
//   [hr]                             → divider
//
// Legacy tags ([label], [macro], [inset]) are still understood so existing
// docs keep rendering, but the editor guide only teaches the trimmed set.

import { parse, type HTMLElement, type Node } from 'node-html-parser';
import { DOC_SOURCES, type DocSource } from '../config/docs';
import { VALID_COLORS } from '../config/site';

export interface Card {
  title: string;
  color: string;
  width: 'half' | 'full';
  bodyHtml: string;
}
export interface Section {
  title: string;
  assetKey: string | null;
  cards: Card[];
}
export interface DocContent {
  sections: Section[];
  lastUpdated: string;
  /** True when the doc isn't wired up / couldn't be fetched. */
  placeholder?: boolean;
}

const VALID = VALID_COLORS as unknown as string[];

// ── Fetching ───────────────────────────────────────────────

function isConfigured(src: DocSource | undefined): boolean {
  return !!(src && ((src.docId && src.docId.trim()) || (src.pubUrl && src.pubUrl.trim())));
}

async function fetchDocHtml(src: DocSource): Promise<string> {
  const url = src.pubUrl?.trim()
    ? src.pubUrl.trim()
    : `https://docs.google.com/document/d/${src.docId!.trim()}/export?format=html`;

  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return await res.text();
}

// ── Public API ─────────────────────────────────────────────

export async function getDocContent(docKey: string): Promise<DocContent> {
  const src = DOC_SOURCES[docKey];

  if (!isConfigured(src)) {
    return placeholderContent(
      'Not wired up yet',
      `This page has no Google Doc assigned. Open <code>src/config/docs.ts</code> and set a <code>docId</code> or <code>pubUrl</code> for <code>${escapeHtml(docKey)}</code>, then rebuild.`,
    );
  }

  let html: string;
  try {
    html = await fetchDocHtml(src);
  } catch (err) {
    return placeholderContent(
      'Could not load the doc',
      `The build could not read this doc. Make sure it is published / shared so "Anyone with the link" can view. Error: <code>${escapeHtml(String(err))}</code>`,
    );
  }

  try {
    return parseDocHtml(html);
  } catch (err) {
    return placeholderContent(
      'Could not parse the doc',
      `The doc was fetched but could not be parsed. Error: <code>${escapeHtml(String(err))}</code>`,
    );
  }
}

/** First N cards of the announcements doc, for the home "Latest Dispatches". */
export async function getLatestDispatches(
  n = 4,
): Promise<{ title: string; color: string }[]> {
  const src = DOC_SOURCES['announcements'];
  if (!isConfigured(src)) return [];
  try {
    const content = await getDocContent('announcements');
    if (content.placeholder || !content.sections.length) return [];
    const cards = content.sections[0].cards || [];
    return cards.slice(0, n).map((c) => ({ title: c.title, color: c.color }));
  } catch {
    return [];
  }
}

// ── Parsing ────────────────────────────────────────────────

function parseDocHtml(html: string): DocContent {
  const root = parse(html, {
    lowerCaseTagName: true,
    comment: false,
    blockTextElements: { script: false, style: true, noscript: false },
  });

  const { bold, italic } = collectStyleClasses(root);
  const body = root.querySelector('body') ?? root;

  const sections: Section[] = [];
  let curSection: Section | null = null;
  let curCard: Card | null = null;
  let listBuf: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (!listBuf.length || !curCard) {
      listBuf = [];
      listType = null;
      return;
    }
    curCard.bodyHtml += `<${listType}>${listBuf.map((li) => `<li>${li}</li>`).join('')}</${listType}>`;
    listBuf = [];
    listType = null;
  };
  const flushCard = () => {
    flushList();
    if (curCard) {
      if (!curSection) curSection = { title: '', assetKey: null, cards: [] };
      curCard.bodyHtml = postProcessTags(curCard.bodyHtml);
      curSection.cards.push(curCard);
      curCard = null;
    }
  };
  const flushSection = () => {
    flushCard();
    if (curSection) sections.push(curSection);
    curSection = null;
  };

  const ctx = { bold, italic };

  const walk = (node: Node) => {
    if (!isElement(node)) return;
    const el = node as HTMLElement;
    const tag = el.rawTagName?.toLowerCase();
    if (!tag || tag === 'head' || tag === 'style' || tag === 'script') return;

    switch (tag) {
      case 'h1': {
        flushSection();
        const meta = parseHeadingMeta(el.text.trim());
        curSection = { title: meta.title, assetKey: meta.bracket, cards: [] };
        return;
      }
      case 'h2': {
        flushCard();
        const m = parseCardMeta(el.text.trim());
        curCard = { title: m.title, color: m.color, width: m.width, bodyHtml: '' };
        return;
      }
      case 'h3': {
        flushList();
        const inline = renderInline(el, ctx);
        if (curCard && inline.trim()) {
          curCard.bodyHtml += `<p class="subheading">${inline}</p>`;
        }
        return;
      }
      case 'p': {
        flushList();
        const inline = renderInline(el, ctx);
        if (curCard && inline.trim()) {
          curCard.bodyHtml += `<p>${inline}</p>`;
        }
        return;
      }
      case 'ul':
      case 'ol': {
        // Descend to list items; keep single-level like the original parser.
        for (const li of el.childNodes) {
          if (isElement(li) && (li as HTMLElement).rawTagName?.toLowerCase() === 'li') {
            const newType: 'ul' | 'ol' = tag === 'ol' ? 'ol' : 'ul';
            if (listType && listType !== newType) flushList();
            listType = newType;
            const inline = renderInline(li as HTMLElement, ctx);
            if (inline.trim()) listBuf.push(inline);
          }
        }
        return;
      }
      default: {
        // Container (body, div, span-wrappers, etc.) — descend.
        for (const child of el.childNodes) walk(child);
      }
    }
  };

  for (const child of body.childNodes) walk(child);
  flushSection();

  if (!sections.length) {
    return placeholderContent(
      'This doc looks empty',
      'No Heading 1 / Heading 2 structure was found. Add a Heading 1 section and at least one Heading 2 card.',
    );
  }

  return { sections, lastUpdated: new Date().toISOString() };
}

// Build sets of class names that mean bold / italic, from <style> blocks
// (Google's published HTML styles bold/italic via classes, e.g. .c3{font-weight:700}).
function collectStyleClasses(root: HTMLElement): { bold: Set<string>; italic: Set<string> } {
  const bold = new Set<string>();
  const italic = new Set<string>();
  const styles = root.querySelectorAll('style');
  const ruleRe = /([^{}]+)\{([^}]*)\}/g;
  for (const style of styles) {
    const css = style.text || '';
    let m: RegExpExecArray | null;
    while ((m = ruleRe.exec(css))) {
      const selector = m[1];
      const decl = m[2].toLowerCase();
      const isBold = /font-weight\s*:\s*(?:bold|[6-9]00)/.test(decl);
      const isItalic = /font-style\s*:\s*italic/.test(decl);
      if (!isBold && !isItalic) continue;
      const classRe = /\.([\w-]+)/g;
      let c: RegExpExecArray | null;
      while ((c = classRe.exec(selector))) {
        if (isBold) bold.add(c[1]);
        if (isItalic) italic.add(c[1]);
      }
    }
  }
  return { bold, italic };
}

interface InlineCtx {
  bold: Set<string>;
  italic: Set<string>;
}

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  link: string | null;
}

function renderInline(block: HTMLElement, ctx: InlineCtx): string {
  const runs: Run[] = [];
  collectRuns(block, ctx, { bold: false, italic: false, link: null }, runs);

  // Coalesce adjacent runs with identical formatting.
  let html = '';
  for (const r of runs) {
    if (!r.text) continue;
    html += wrapRun(r.text, r.bold, r.italic, r.link);
  }
  return html;
}

function collectRuns(
  node: Node,
  ctx: InlineCtx,
  inherited: { bold: boolean; italic: boolean; link: string | null },
  out: Run[],
): void {
  if (isText(node)) {
    const text = decodeEntities((node as any).rawText ?? node.text ?? '');
    if (text) out.push({ text, bold: inherited.bold, italic: inherited.italic, link: inherited.link });
    return;
  }
  if (!isElement(node)) return;
  const el = node as HTMLElement;
  const tag = el.rawTagName?.toLowerCase();
  if (tag === 'style' || tag === 'script') return;
  if (tag === 'br') {
    out.push({ text: '\n', bold: false, italic: false, link: null });
    return;
  }

  const next = { ...inherited };
  const style = (el.getAttribute('style') || '').toLowerCase();
  const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);

  if (
    tag === 'b' ||
    tag === 'strong' ||
    /font-weight\s*:\s*(?:bold|[6-9]00)/.test(style) ||
    classes.some((c) => ctx.bold.has(c))
  ) {
    next.bold = true;
  }
  if (
    tag === 'i' ||
    tag === 'em' ||
    /font-style\s*:\s*italic/.test(style) ||
    classes.some((c) => ctx.italic.has(c))
  ) {
    next.italic = true;
  }
  if (tag === 'a') {
    const href = el.getAttribute('href');
    if (href) next.link = unwrapGoogleUrl(href);
  }

  for (const child of el.childNodes) collectRuns(child, ctx, next, out);
}

function wrapRun(str: string, bold: boolean, italic: boolean, link: string | null): string {
  let out = escapeHtml(str);
  if (bold) out = `<span class="bold">${out}</span>`;
  if (italic) out = `<span class="italic">${out}</span>`;
  if (link) out = `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${out}</a>`;
  return out;
}

// ── Meta parsing (headings / cards) ────────────────────────

function parseHeadingMeta(text: string): { title: string; bracket: string | null } {
  const m = text.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (!m) return { title: text, bracket: null };
  return { title: m[1].trim(), bracket: m[2].trim().toLowerCase() };
}

function parseCardMeta(text: string): { title: string; color: string; width: 'half' | 'full' } {
  const m = text.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (!m) return { title: text, color: 'shire', width: 'half' };

  const parts = m[2].split(',').map((s) => s.trim().toLowerCase());
  for (const p of parts) {
    if (p !== 'full' && p !== 'half' && VALID.indexOf(p) === -1) {
      // Not real metadata (probably part of the title) — leave it in the title.
      return { title: text, color: 'shire', width: 'half' };
    }
  }
  let color = 'shire';
  let width: 'half' | 'full' = 'half';
  for (const p of parts) {
    if (p === 'full' || p === 'half') width = p;
    else if (VALID.indexOf(p) !== -1) color = p;
  }
  return { title: m[1].trim(), color, width };
}

// ── Tag post-processing (callout/label/macro/hr/inset) ─────

function postProcessTags(html: string): string {
  html = html.replace(
    /<p>\s*(\[(?:callout|macro|subheading|inset)[^\]]*\][\s\S]*?\[\/(?:callout|macro|subheading|inset)\])\s*<\/p>/g,
    '$1',
  );
  html = html.replace(/<p>\s*\[hr\]\s*<\/p>/g, '[hr]');

  html = html.replace(/\[callout\s+(\w+)\]([\s\S]*?)\[\/callout\]/g, (_m, color: string, inner: string) => {
    color = color.toLowerCase();
    if (VALID.indexOf(color) === -1) color = 'shire';
    return `<div class="callout callout-${color}">${inner.trim()}</div>`;
  });

  html = html.replace(/\[macro(?:\s+(\w+))?\]([\s\S]*?)\[\/macro\]/g, (_m, color: string, inner: string) => {
    const plain = inner.replace(/<[^>]+>/g, '').trim();
    if (color && VALID.indexOf(color.toLowerCase()) !== -1) {
      return `<div class="macro-chip macro-${color.toLowerCase()}">${escapeHtml(plain)}</div>`;
    }
    return `<div class="macro-chip">${escapeHtml(plain)}</div>`;
  });

  html = html.replace(/\[label\s+(\w+)\]([\s\S]*?)\[\/label\]/g, (_m, color: string, inner: string) => {
    color = color.toLowerCase();
    if (VALID.indexOf(color) === -1) color = 'shire';
    const plain = inner.replace(/<[^>]+>/g, '').trim();
    return `<span class="label label-${color}">${escapeHtml(plain)}</span>`;
  });

  html = html.replace(/\[subheading\]([\s\S]*?)\[\/subheading\]/g, (_m, inner: string) => {
    return `<p class="subheading">${inner.trim()}</p>`;
  });

  html = html.replace(/\[inset\]([\s\S]*?)\[\/inset\]/g, (_m, inner: string) => {
    const idx = inner.indexOf('|');
    if (idx > -1) {
      return `<div class="inset-box"><p class="bold">${inner.substring(0, idx).trim()}</p><p>${inner.substring(idx + 1).trim()}</p></div>`;
    }
    return `<div class="inset-box"><p>${inner.trim()}</p></div>`;
  });

  html = html.replace(/\[hr\]/g, '<hr class="divider">');
  return html;
}

// ── Helpers ────────────────────────────────────────────────

function placeholderContent(title: string, body: string): DocContent {
  return {
    placeholder: true,
    sections: [
      {
        title: '',
        assetKey: null,
        cards: [{ title, color: 'shadow', width: 'full', bodyHtml: `<p>${body}</p>` }],
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

function unwrapGoogleUrl(href: string): string {
  // Google wraps links as https://www.google.com/url?q=<real>&sa=...
  const m = href.match(/[?&]q=([^&]+)/);
  if (href.includes('google.com/url') && m) {
    try {
      return decodeURIComponent(m[1]);
    } catch {
      return m[1];
    }
  }
  return href;
}

function isElement(node: Node): boolean {
  return (node as any).nodeType === 1;
}
function isText(node: Node): boolean {
  return (node as any).nodeType === 3;
}

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// node-html-parser leaves entities encoded in rawText; decode the common ones
// so escapeHtml doesn't double-encode.
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(parseInt(d, 10)));
}
