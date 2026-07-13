// build-scheduling.js
// Generates Scheduling.docx for the Fellowship doc-parser.
// Maps to DOC_IDS.scheduling.
//
// CONVENTIONS (matched to the parser in Code.gs):
//   Heading 2: card title + bracket metadata, e.g. "Card Title [evenstar]"
//   Heading 3: subheading within a card body
//   Inline tags:
//     [callout color]...[/callout]   block callout
//     [label color]Text[/label]      uppercase tag
//     [hr]                           horizontal divider
//   Bold and italic are real Word formatting.
//   Lists are real Word bullet lists (single-level only).

const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, ExternalHyperlink
} = require('docx');

// ---------- helpers ----------
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

function P(pieces, opts) {
  opts = opts || {};
  let children = [];
  if (opts.prefix) children.push(new TextRun({ text: opts.prefix }));
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
  if (opts.suffix) children.push(new TextRun({ text: opts.suffix }));
  return new Paragraph({ children });
}

function Callout(color, pieces, opts) {
  opts = opts || {};
  let prefix = '[callout ' + color + '] ';
  if (opts.label) prefix += '[label ' + color + ']' + opts.label + '[/label] ';
  return P(pieces, { prefix, suffix: ' [/callout]' });
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

// ---------- doc content ----------
const body = [];

// ==========================================================
// 1. PLANNED TIME OFF
// ==========================================================
body.push(H2('Planned Time Off [evenstar]'));
body.push(P(['Planning a trip? Need to just not be here for a little bit?']));
body.push(Callout('evenstar',
  ['Please ensure you submit these requests ', ['b', '48 hours in advance.']],
  { label: 'Heads Up' }
));
body.push(P(['All planned time off requests must be submitted in ', ['b', 'both ADP and Assembled'], '.']));
body.push(Bullet(['In ADP, submit as ', ['b', 'UTO'], ' (unpaid time off).']));
body.push(Bullet(['In Assembled, submit as ', ['b', 'PTO'], ' (planned time off).']));
body.push(HR());
body.push(P(['If you mess up your time off request or need to cancel it, you can remove the request in ADP. Once it is out of ADP, you are free to work your normal shift.']));

// ==========================================================
// 2. UNPLANNED TIME OFF
// ==========================================================
body.push(H2('Unplanned Time Off [twilight]'));
body.push(P(['Emergencies happen. We understand this.']));

body.push(Label('shire', 'What We Expect'));
body.push(P(['Submit an absence report through the Slack workflow:']));
body.push(Bullet(['Select the appropriate reason: medical/sick, family related, weather related, internet/power outage, late, or other.']));
body.push(Bullet(['Double-check that dates are entered correctly.']));
body.push(Bullet(['For mid-shift absences, the start and end dates will be the same.']));
body.push(Bullet(['Enter the exact time away (the dropdown allows text input for accuracy).']));
body.push(Bullet(['Send a quick DM to your lead in case the workflow doesn\'t populate right away.']));

body.push(P([['b', 'Timing requirements:']]));
body.push(Bullet(['Absences must be reported at least ', ['b', '1 hour before'], ' your shift begins.']));
body.push(Bullet(['If you leave mid-shift, any absence longer than ', ['b', '5 minutes'], ' must be submitted for the actual time missed.']));

body.push(HR());
body.push(Label('shadow', 'What We Do NOT Expect'));
body.push(Callout('shadow',
  ['You never need to give us the details. If you\'re not feeling well, that\'s enough. If you\'ve had an emergency, that\'s all you need to say. We never expect detailed information from you.']
));

// ---------- document ----------
const doc = new Document({
  creator: 'Fellowship of the Fix',
  title: 'Scheduling & Time Off',
  description: 'Doc-driven content for the Scheduling & Time Off page.',
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22 } }
    },
    paragraphStyles: [
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
          text: 'Fellowship of the Fix — Scheduling & Time Off (working draft).',
          bold: true, size: 22
        })]
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'This doc is read by the new web app. Heading 2 starts a card; brackets after the title set color (e.g. "[evenstar]"). Body uses inline [callout], [label], and [hr] tags.',
          italics: true, size: 20, color: '666666'
        })]
      }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...body
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Scheduling.docx', buf);
  console.log('Wrote Scheduling.docx (' + buf.length + ' bytes)');
});
