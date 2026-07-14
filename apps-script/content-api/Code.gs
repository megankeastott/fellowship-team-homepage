// ============================================================
// FELLOWSHIP CONTENT PUBLISHER — Apps Script
// ============================================================
//
// Varsity Workspace blocks "Anyone" web apps, so Netlify cannot
// pull from an /exec URL. Instead this script PUSHES parsed doc
// JSON into the GitHub repo. Netlify builds from those files.
//
// SETUP (see README.md in this folder):
//   Script properties: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
//   Run publishToGitHub() once to authorize + publish.
// ============================================================

var DOC_IDS = {
  announcements: '1qaVGUAixK7KhNGMW3cSsEpygUNpcMoSXRq_R5Ker1mA',
  archives: '1ebPBsCehXgVX95XsrIGUosD9_7GSkPPHVJacdQoZBk8',
  workExpectations: '1JVL93UxzBDSioh2vudp2pXd5jbTw-QnCs02gA-Ml3ds',
  scheduling: '1qtkd37RGpW55OiFxZ5maWpMP3W7phWGTUW-l8hKT08Q',
  fraudFlags: '1YUIZsNcBtFMx9Dmr-x_k38XIKRb7qEmHDQSDbQHZsVs',
  documentation: '1yakDziTqEa5W-87FJdC1W-0dAMjmdhvDY8_OVfIETN8',
  microTrainings: '1LX7UzMhZVDHX-HgdjIpXdFtahv-n9c88_Sto66FpWMU',
  trainingMaterials: '1huNE5Yf-qaoR2oNEOAMuVA3SAUqq0s_IZtwV1bl4HTE'
};

var CONTENT_PATH_PREFIX = 'src/content/docs/';
var VALID_COLORS = ['shire', 'hearth', 'evenstar', 'earthen', 'shadow', 'twilight'];


// ============================================================
// PUBLISH
// ============================================================

/**
 * Parse every doc and commit JSON files to GitHub.
 * Run this from the Apps Script editor (or a time-driven trigger).
 */
function publishToGitHub() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('GITHUB_TOKEN');
  var owner = props.getProperty('GITHUB_OWNER') || 'megankeastott';
  var repo = props.getProperty('GITHUB_REPO') || 'fellowship-team-homepage';
  var branch = props.getProperty('GITHUB_BRANCH') || 'main';

  if (!token) {
    throw new Error(
      'Missing Script property GITHUB_TOKEN. ' +
      'Add it under Project Settings → Script properties.'
    );
  }

  var keys = Object.keys(DOC_IDS);
  var results = [];

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var docId = DOC_IDS[key];
    Logger.log('Parsing ' + key + ' …');
    var content = parseDoc(docId);
    var path = CONTENT_PATH_PREFIX + key + '.json';
    var body = JSON.stringify(content, null, 2) + '\n';
    putGitHubFile(token, owner, repo, branch, path, body,
      'content: publish ' + key + ' from Google Doc');
    results.push(key + ' → ' + path + ' (' + content.sections.length + ' sections)');
  }

  Logger.log('Published:\n' + results.join('\n'));
  return results;
}


// ============================================================
// GITHUB HELPERS
// ============================================================

function putGitHubFile(token, owner, repo, branch, path, content, message) {
  var apiBase = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path;
  var sha = null;

  // Existing file sha (required for updates)
  var getRes = UrlFetchApp.fetch(apiBase + '?ref=' + encodeURIComponent(branch), {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'fellowship-content-publisher'
    },
    muteHttpExceptions: true
  });
  if (getRes.getResponseCode() === 200) {
    sha = JSON.parse(getRes.getContentText()).sha;
  } else if (getRes.getResponseCode() !== 404) {
    throw new Error('GitHub GET ' + path + ' failed: ' + getRes.getResponseCode() + ' ' + getRes.getContentText());
  }

  var payload = {
    message: message,
    content: Utilities.base64Encode(content, Utilities.Charset.UTF_8),
    branch: branch
  };
  if (sha) payload.sha = sha;

  var putRes = UrlFetchApp.fetch(apiBase, {
    method: 'put',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'fellowship-content-publisher'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var code = putRes.getResponseCode();
  if (code !== 200 && code !== 201) {
    throw new Error('GitHub PUT ' + path + ' failed: ' + code + ' ' + putRes.getContentText());
  }
}


// ============================================================
// DOC PARSER (same conventions as the site)
// ============================================================

function parseDoc(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var sections = [];
  var curSection = null;
  var curCard = null;
  var listBuf = [];
  var listType = null;

  function flushList() {
    if (!listBuf.length || !curCard) { listBuf = []; listType = null; return; }
    var html = '<' + listType + '>';
    for (var i = 0; i < listBuf.length; i++) html += '<li>' + listBuf[i] + '</li>';
    html += '</' + listType + '>';
    curCard.bodyHtml += html;
    listBuf = [];
    listType = null;
  }

  function flushCard() {
    flushList();
    if (curCard) {
      if (!curSection) curSection = { title: '', assetKey: null, cards: [] };
      curCard.bodyHtml = postProcessTags(curCard.bodyHtml);
      curSection.cards.push(curCard);
      curCard = null;
    }
  }

  function flushSection() {
    flushCard();
    if (curSection) sections.push(curSection);
    curSection = null;
  }

  var n = body.getNumChildren();
  for (var i = 0; i < n; i++) {
    var child = body.getChild(i);
    var type = child.getType();

    if (type === DocumentApp.ElementType.PARAGRAPH) {
      var para = child.asParagraph();
      var heading = para.getHeading();
      var text = para.getText().trim();

      if (heading === DocumentApp.ParagraphHeading.HEADING1) {
        flushSection();
        var meta = parseHeadingMeta(text);
        curSection = { title: meta.title, assetKey: meta.bracket, cards: [] };
      } else if (heading === DocumentApp.ParagraphHeading.HEADING2) {
        flushCard();
        var cMeta = parseCardMeta(text);
        curCard = { title: cMeta.title, color: cMeta.color, width: cMeta.width, bodyHtml: '' };
      } else if (heading === DocumentApp.ParagraphHeading.HEADING3) {
        flushList();
        if (curCard && text) {
          curCard.bodyHtml += '<p class="subheading">' + renderInline(para) + '</p>';
        }
      } else {
        flushList();
        if (curCard && text) {
          curCard.bodyHtml += '<p>' + renderInline(para) + '</p>';
        }
      }
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      var item = child.asListItem();
      var glyph = item.getGlyphType();
      var newType = isOrderedGlyph(glyph) ? 'ol' : 'ul';
      if (listType && listType !== newType) flushList();
      listType = newType;
      listBuf.push(renderInline(item));
    }
  }
  flushSection();

  return { sections: sections, lastUpdated: new Date().toISOString() };
}

function isOrderedGlyph(g) {
  if (!g) return false;
  return g === DocumentApp.GlyphType.NUMBER ||
         g === DocumentApp.GlyphType.LATIN_LOWER ||
         g === DocumentApp.GlyphType.LATIN_UPPER ||
         g === DocumentApp.GlyphType.ROMAN_LOWER ||
         g === DocumentApp.GlyphType.ROMAN_UPPER;
}

function parseHeadingMeta(text) {
  var m = text.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (!m) return { title: text, bracket: null };
  return { title: m[1].trim(), bracket: m[2].trim().toLowerCase() };
}

function parseCardMeta(text) {
  var m = text.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (!m) return { title: text, color: 'shire', width: 'half' };

  var parts = m[2].split(',').map(function(s) { return s.trim().toLowerCase(); });
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (p !== 'full' && p !== 'half' && VALID_COLORS.indexOf(p) === -1) {
      return { title: text, color: 'shire', width: 'half' };
    }
  }

  var color = 'shire', width = 'half';
  for (var j = 0; j < parts.length; j++) {
    if (parts[j] === 'full' || parts[j] === 'half') width = parts[j];
    else if (VALID_COLORS.indexOf(parts[j]) !== -1) color = parts[j];
  }
  return { title: m[1].trim(), color: color, width: width };
}

function renderInline(element) {
  var html = '';
  var num = element.getNumChildren();
  for (var i = 0; i < num; i++) {
    var child = element.getChild(i);
    if (child.getType() === DocumentApp.ElementType.TEXT) {
      html += renderTextRuns(child.asText());
    }
  }
  return html;
}

function renderTextRuns(textEl) {
  var str = textEl.getText();
  var n = str.length;
  if (n === 0) return '';

  var html = '';
  var start = 0;
  var curB = !!textEl.isBold(0);
  var curI = !!textEl.isItalic(0);
  var curLink = textEl.getLinkUrl(0) || null;

  for (var i = 1; i < n; i++) {
    var b = !!textEl.isBold(i);
    var it = !!textEl.isItalic(i);
    var link = textEl.getLinkUrl(i) || null;
    if (b !== curB || it !== curI || link !== curLink) {
      html += wrapRun(str.substring(start, i), curB, curI, curLink);
      start = i;
      curB = b; curI = it; curLink = link;
    }
  }
  html += wrapRun(str.substring(start, n), curB, curI, curLink);
  return html;
}

function wrapRun(str, bold, italic, link) {
  var out = escapeHtml(str);
  if (bold)   out = '<span class="bold">' + out + '</span>';
  if (italic) out = '<span class="italic">' + out + '</span>';
  if (link)   out = '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">' + out + '</a>';
  return out;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function postProcessTags(html) {
  html = html.replace(
    /<p>\s*(\[(?:callout|macro|subheading|inset)[^\]]*\][\s\S]*?\[\/(?:callout|macro|subheading|inset)\])\s*<\/p>/g,
    '$1'
  );
  html = html.replace(/<p>\s*\[hr\]\s*<\/p>/g, '[hr]');

  html = html.replace(/\[callout\s+(\w+)\]([\s\S]*?)\[\/callout\]/g, function(_, color, inner) {
    color = color.toLowerCase();
    if (VALID_COLORS.indexOf(color) === -1) color = 'shire';
    return '<div class="callout callout-' + color + '">' + inner.trim() + '</div>';
  });

  html = html.replace(/\[macro(?:\s+(\w+))?\]([\s\S]*?)\[\/macro\]/g, function(_, color, inner) {
    var plain = inner.replace(/<[^>]+>/g, '').trim();
    if (color && VALID_COLORS.indexOf(color.toLowerCase()) !== -1) {
      return '<div class="macro-chip macro-' + color.toLowerCase() + '">' + escapeHtml(plain) + '</div>';
    }
    return '<div class="macro-chip">' + escapeHtml(plain) + '</div>';
  });

  html = html.replace(/\[label\s+(\w+)\]([\s\S]*?)\[\/label\]/g, function(_, color, inner) {
    color = color.toLowerCase();
    if (VALID_COLORS.indexOf(color) === -1) color = 'shire';
    var plain = inner.replace(/<[^>]+>/g, '').trim();
    return '<span class="label label-' + color + '">' + escapeHtml(plain) + '</span>';
  });

  html = html.replace(/\[subheading\]([\s\S]*?)\[\/subheading\]/g, function(_, inner) {
    return '<p class="subheading">' + inner.trim() + '</p>';
  });

  html = html.replace(/\[inset\]([\s\S]*?)\[\/inset\]/g, function(_, inner) {
    var idx = inner.indexOf('|');
    if (idx > -1) {
      return '<div class="inset-box"><p class="bold">' + inner.substring(0, idx).trim()
           + '</p><p>' + inner.substring(idx + 1).trim() + '</p></div>';
    }
    return '<div class="inset-box"><p>' + inner.trim() + '</p></div>';
  });

  html = html.replace(/\[hr\]/g, '<hr class="divider">');
  return html;
}
