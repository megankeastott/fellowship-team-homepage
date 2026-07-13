// build-work-expectations.js
// Generates Work_Expectations.docx for the Fellowship doc-parser.
// Maps to DOC_IDS.workExpectations.
//
// CONVENTIONS (matched to the parser in Code.gs):
//   Heading 1: section name + optional bracket icon (e.g. "[quill]")
//     — omitted here because the page only has one section and the page
//       heading already says "Work Expectations".
//   Heading 2: card title + bracket metadata, e.g. "Card Title [shadow, full]"
//   Heading 3: subheading within a card body
//   Inline tags inside body paragraphs:
//     [callout color]...[/callout]     block callout box
//     [label color]Text[/label]        small uppercase tag
//     [inset]HEADER|body text[/inset]  bordered template block (metric-like)
//     [hr]                             horizontal divider
//   Bold and italic are real Word formatting.
//   Lists are real Word bullet lists (single-level; sub-bullets flatten).

const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, ExternalHyperlink
} = require('docx');

// ---------- helpers ----------

function H1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true })]
  });
}

function H2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true })]
  });
}

function H3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true })]
  });
}

// Build a paragraph from a mini-DSL.
function P(pieces, opts) {
  opts = opts || {};
  let children = [];
  if (opts.prefix) children.push(new TextRun({ text: opts.prefix }));
  for (const piece of pieces) {
    if (typeof piece === 'string') {
      children.push(new TextRun({ text: piece }));
    } else if (Array.isArray(piece)) {
      if (piece[0] === 'b') {
        children.push(new TextRun({ text: piece[1], bold: true }));
      } else if (piece[0] === 'i') {
        children.push(new TextRun({ text: piece[1], italics: true }));
      } else if (piece[0] === 'link') {
        children.push(new ExternalHyperlink({
          link: piece[2],
          children: [new TextRun({ text: piece[1], style: 'Hyperlink' })]
        }));
      }
    }
  }
  if (opts.suffix) children.push(new TextRun({ text: opts.suffix }));
  return new Paragraph({ children });
}

function Callout(color, pieces, opts) {
  opts = opts || {};
  let prefix = '[callout ' + color + '] ';
  if (opts.label) prefix += '[label ' + color + ']' + opts.label + '[/label] ';
  return P(pieces, { prefix, suffix: ' [/callout]' });
}

function Inset(header, body) {
  return new Paragraph({
    children: [new TextRun({ text: '[inset]' + header + '|' + body + '[/inset]' })]
  });
}

function Label(color, text) {
  return new Paragraph({
    children: [new TextRun({ text: '[label ' + color + ']' + text + '[/label]' })]
  });
}

function Bullet(pieces) {
  let children = [];
  for (const piece of pieces) {
    if (typeof piece === 'string') {
      children.push(new TextRun({ text: piece }));
    } else if (Array.isArray(piece)) {
      if (piece[0] === 'b')      children.push(new TextRun({ text: piece[1], bold: true }));
      else if (piece[0] === 'i') children.push(new TextRun({ text: piece[1], italics: true }));
      else if (piece[0] === 'link') {
        children.push(new ExternalHyperlink({
          link: piece[2],
          children: [new TextRun({ text: piece[1], style: 'Hyperlink' })]
        }));
      }
    }
  }
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children
  });
}

function HR() {
  return new Paragraph({ children: [new TextRun({ text: '[hr]' })] });
}

const SPACER = new Paragraph({ children: [new TextRun({ text: '' })] });

// ---------- doc content ----------
const body = [];

// No H1 — the page heading already shows "Work Expectations" and a second
// section indicator below it would be visual noise. All 8 H2 cards belong
// to one implicit section (the parser tolerates this).

// ==========================================================
// 1. METRICS: EXPLAINED
// ==========================================================
body.push(H2('Metrics: Explained [evenstar, full]'));
body.push(P(['Metrics are tracked weekly and daily. Both will come with scorecards so you can always stay up to date with how you are performing throughout the week. This decision was made because the daily scorecard will show the components that make up the averaged categories, such as handle time.']));
body.push(Label('evenstar', 'Metric Goals & What They Mean'));
body.push(Inset('QA Score — 90%',
  'Leads and seniors manually review your interactions and grade them against a scorecard. This measures how well we are performing in our conversations with tutors.'));
body.push(Inset('Avg Adherence — >90%',
  'Also called productive adherence — tracks your status changes. Was this agent where they were supposed to be? Discrepancies are investigated for Assembled reporting issues or agent support needs.'));
body.push(Inset('Avg Acceptance — 95%',
  'How many interactions you accepted vs. how many were sent to you. Tracks chats only.'));
body.push(Inset('Avg Handle Time — Varies',
  'How long you were in an interaction. Emails: tracked from first response to solve. Chats: begins upon assignment. LLP & Tutor Chat: 15 min · TES Tickets: 10 min · LLP Tickets: 20 min.'));
body.push(Inset('Solved Tickets — 95 / 100',
  '95% of 100 tickets. You can turn your ticket count into a percentage because of how easy this metric is to calculate.'));
body.push(Inset('Behavior & Productive Scores — Weekly',
  'Reflective of your metrics for the week and based on the goals above.'));

// ==========================================================
// 2. ZENDESK NOTIFICATIONS & SYSTEM REQUIREMENTS
// ==========================================================
body.push(H2('Zendesk Notifications & System Requirements [twilight, full]'));
body.push(P([['b', 'Moving forward, please choose one of the following options:']]));

body.push(H3('Option 1 — Dedicated Zendesk Monitor (Preferred)'));
body.push(P(['If you have multiple monitors, keep Zendesk open and visible on one screen at all times during your shift. Do not minimize it or leave it running in a background tab.']));

body.push(H3('Option 2 — Disable Chrome Memory Saver for Zendesk'));
body.push(P(['If you are using a single monitor, disable Chrome\'s Memory Saver setting specifically for Zendesk (or turn Memory Saver off entirely):']));
body.push(Bullet(['Open Google Chrome.']));
body.push(Bullet(['Click the three dots in the top-right corner.']));
body.push(Bullet(['Select ', ['b', 'Settings'], '.']));
body.push(Bullet(['In the left menu, click ', ['b', 'Performance'], '.']));
body.push(Bullet(['Locate ', ['b', 'Memory Saver'], ' and toggle it off.']));

body.push(Callout('twilight',
  ['The goal is to ensure Zendesk remains fully active so you consistently receive chat notifications. We\'ll monitor acceptance rates closely over the next few days. If you notice anything unusual (missed alerts, delayed sounds, etc.), report it immediately.'],
  { label: 'Note' }
));

// ==========================================================
// 3. CHAT HANDLING
// ==========================================================
body.push(H2('Chat Handling [earthen]'));
body.push(P(['Chat handle times are ', ['b', '10 minutes for Tutor Support'], ' and ', ['b', '15 minutes for LLP'], '. Because of this, it is important to develop a habit of ending and closing chats in a timely manner.']));
body.push(Bullet(['If a tutor is unresponsive, wait 3–5 minutes before sending an ', ['i', '"Are you still with me?"'], ' message. Do not wait longer.']));
body.push(Bullet(['If the tutor does not respond 3–5 minutes after your check-in, send your closing.']));
body.push(Bullet(['End the chat session.']));
body.push(Bullet(['Populate your internal notes.']));
body.push(Bullet(['Solve the ticket — do not use chat tickets for anything else.']));

// ==========================================================
// 4. BREAKS / MEALS & TIMING
// ==========================================================
body.push(H2('Breaks / Meals & Timing [hearth]'));
body.push(P(['Since we track Productive Adherence, it is important to move between breaks, meals, and queue changes in a deliberate way.']));
body.push(Bullet(['Put yourself into the corresponding status in Zendesk ', ['b', '5 minutes prior'], ' to the change — Go into Break, or Go into Meal.']));
body.push(Bullet(['If you are struggling to get out of a chat, reach out to your senior or lead so we can determine if transferring the chat to a different agent is the right call.']));

// ==========================================================
// 5. CROSS TEAM ESCALATIONS
// ==========================================================
body.push(H2('Cross Team Escalations [shadow]'));
body.push(P([['b', 'Under no circumstances should we ever be transferring tickets to another team.']]));
body.push(P(['If a tutor reaches out about an issue we do not handle:']));
body.push(Bullet(['Get full details from the tutor on what they are experiencing.']));
body.push(Bullet(['Create a new ticket on behalf of the tutor for the correct team.']));
body.push(Bullet(['Provide the tutor with the ticket ID.']));
body.push(Callout('shadow',
  ['Applicants and placement requests should still be handled by using ', ['b', '#transferchat'], '. The placement team phone number is ', ['b', '888-315-5816'], '.'],
  { label: 'Exceptions' }
));
body.push(P([['b', 'Returning tickets:'], ' if another team sends us a ticket that is out of scope, we can send it back to them.']));

// ==========================================================
// 6. MASTERTICKETS
// ==========================================================
body.push(H2('Mastertickets [shire]'));
body.push(P(['Before escalating a ticket to tech or asking for help on a tech ticket, always determine if there is a masterticket first.']));
body.push(P(['The ', ['link', 'Masterticket sheet', 'https://docs.google.com/spreadsheets/d/1rWim4Dru0l3jnnnkPKKXg83fGN9YnBEK2AvRGChSiyg/edit?usp=sharing'], ' contains all current mastertickets.']));
body.push(P(['If you have forgotten how to link to a masterticket, there is a video available in the resources section.']));

// ==========================================================
// 7. ESCALATION PATH
// ==========================================================
body.push(H2('Escalation Path [twilight]'));
body.push(P(['Pay attention to statuses and notification settings for leads and seniors. We all have focus-heavy tasks throughout the week, and during these times we will change our statuses and turn notifications off. Blocks of focus work range from ', ['b', '20–45 minutes'], '. Another senior or lead will be available while one of us is focusing.']));
body.push(Label('twilight', 'Order of Escalation'));
body.push(Bullet(['Use the ', ['b', '#ask-cal'], ' channel ', ['b', 'first'], '.']));
body.push(Bullet(['Post in ', ['b', '#spa-tech-ular_work'], ' ', ['b', 'second'], '.']));
body.push(Bullet(['@ a senior ', ['b', 'third'], '.']));
body.push(Bullet(['@ a lead ', ['b', 'fourth'], '.']));

// ==========================================================
// 8. STAYING UP TO DATE
// ==========================================================
body.push(H2('Staying Up to Date [evenstar]'));
body.push(P(['There are several channels you should always be checking during your shift. It is mandatory to stay up to date throughout the day — this helps reduce traffic in our channels.']));
body.push(Bullet([['b', '#spa-tech-ular-work']]));
body.push(Bullet([['b', '#spa-tech-ular-dailies']]));
body.push(Bullet([['b', '#tutor-support-chat']]));
body.push(Bullet([['b', '#customer-support-ops-internal-communications-weekly']]));
body.push(P(['Be sure to review previous messages as well — especially if you are reporting something that might be a bug.']));

// ---------- document ----------
const doc = new Document({
  creator: 'Fellowship of the Fix',
  title: 'Work Expectations',
  description: 'Doc-driven content for the Work Expectations page.',
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22 } }
    },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '4a7a3a' },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '4a7878' },
        paragraph: { spacing: { before: 320, after: 100 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Arial', color: '8a7030' },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      new Paragraph({
        children: [new TextRun({
          text: 'Fellowship of the Fix — Work Expectations (working draft).',
          bold: true, size: 22
        })]
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'This doc is read by the new web app. Heading 2 starts a card. Brackets at the end of a Heading 2 set color and width (e.g. "[twilight, full]"). Heading 3 makes an inline subheading inside a card. Body text uses inline [callout], [label], [inset], and [hr] tags — these render automatically.',
          italics: true, size: 20, color: '666666'
        })]
      }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...body
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Work_Expectations.docx', buf);
  console.log('Wrote Work_Expectations.docx (' + buf.length + ' bytes)');
});
