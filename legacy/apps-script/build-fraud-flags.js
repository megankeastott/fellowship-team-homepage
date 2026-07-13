// build-fraud-flags.js
// Generates Fraud_Flags.docx for the Fellowship doc-parser.
// Maps to DOC_IDS.fraudFlags.
//
// CONVENTIONS (matched to the parser in Code.gs):
//   Heading 2: card title + bracket metadata, e.g. "Card Title [shadow, full]"
//   Heading 3: subheading within a card body
//   Inline tags:
//     [callout color]...[/callout]   block callout
//     [label color]Text[/label]      uppercase tag
//     [macro color]TEXT[/macro]      macro chip (HTML is stripped inside)
//     [hr]                           horizontal divider
//   Bold and italic are real Word formatting.
//   Lists: bullet (unordered) and numbered (ordered) — both single-level.

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

function buildRuns(pieces) {
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
  return children;
}

function P(pieces, opts) {
  opts = opts || {};
  let children = [];
  if (opts.prefix) children.push(new TextRun({ text: opts.prefix }));
  children = children.concat(buildRuns(pieces));
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

function Macro(color, text) {
  return new Paragraph({
    children: [new TextRun({ text: '[macro ' + color + ']' + text + '[/macro]' })]
  });
}

function Bullet(pieces) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: buildRuns(pieces)
  });
}

function NumBullet(pieces) {
  return new Paragraph({
    numbering: { reference: 'numbered', level: 0 },
    children: buildRuns(pieces)
  });
}

function HR() {
  return new Paragraph({ children: [new TextRun({ text: '[hr]' })] });
}

// ---------- doc content ----------
const body = [];

// ==========================================================
// 1. FRAUD ALERTS — full width
// ==========================================================
body.push(H2('Fraud Alerts [shadow, full]'));
body.push(P(['Any current and former fraudulent behavior or tutors will be reported here. It is important to familiarize yourself with the information in this section. We have had several bad actors who caused a lot of issues for tutors and the company.']));

body.push(Label('shadow', 'How to Spot Fraud'));
body.push(Bullet([
  ['b', 'ID on file is not the person in the profile picture.'],
  ' Sometimes this is the tutor just being cheeky — always request a new profile picture first before escalating.'
]));
body.push(Bullet([['b', 'Repeated requests for Inova access'], ' — unable to pass PII verification.']));
body.push(Bullet([['b', 'ID on file appears edited:'], ' fonts look off, image is very blurry, signature is not full name.']));

body.push(Callout('shadow',
  ['Fraud can be subtle. When in doubt, escalate. It is always better to flag something that turns out to be nothing than to let a bad actor slip through. If you suspect fraudulent activity, document everything and loop in your lead immediately.'],
  { label: 'Stay Vigilant' }
));

// ==========================================================
// 2. FAKE JOBS
// ==========================================================
body.push(H2('Fake Jobs [earthen]'));
body.push(P(['If anyone reports they received a job offer from someone with an email address ', ['b', '@varsitytutorscareers.com'], ' — it\'s fake.']));

body.push(Label('earthen', 'Steps'));
body.push(NumBullet(['It\'s fake.']));
body.push(NumBullet(['Use the macro ', ['b', 'Operations Support :: Fake Job Offer Response'], ' to reply to them.']));
body.push(NumBullet(['Thread your ticket numbers so they can be sent on to Security.']));

body.push(HR());
body.push(P(['Advise the tutor not to engage, respond, or provide any additional information.']));

// ==========================================================
// 3. THE ANN ARBOR INCIDENT
// ==========================================================
body.push(H2('The Ann Arbor Incident [twilight]'));

body.push(Callout('shadow',
  ['This fraudster is currently active. Do not engage.'],
  { label: 'Status: Active Threat' }
));

body.push(P(['This bad actor (', ['b', 'Krishanu Bose'], ') was taking over accounts (ATO). ATO happens when a person accesses an account that is not theirs by having us reset the password or email, or by gaining access to the original tutor\'s email and resetting the password.']));

body.push(HR());
body.push(Label('twilight', 'Tutor Profile'));
body.push(P([
  ['link', 'Tanish Nichanamelta — view in admin', 'https://www.varsitytutors.com/admin/tutors/880450939']
]));

body.push(Callout('shadow',
  ['If you receive a ticket from this tutor, ', ['b', 'do not reply, do not engage'], '. Immediately assign the ticket to Katie.'],
  { label: 'Action Required' }
));

body.push(HR());
body.push(Label('twilight', 'How to Identify'));
body.push(Callout('twilight',
  ['The original tutor reaches out about strange activity on their account — for example, no longer being able to log in.'],
  { label: 'ATO' }
));

// ---------- document ----------
const doc = new Document({
  creator: 'Fellowship of the Fix',
  title: 'Fraud Flags',
  description: 'Doc-driven content for the Fraud Flags page.',
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22 } }
    },
    paragraphStyles: [
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '6a3028' },
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
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbered',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
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
          text: 'Fellowship of the Fix — Fraud Flags (working draft).',
          bold: true, size: 22
        })]
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'This doc is read by the new web app. Heading 2 starts a card; brackets after the title set color and width (e.g. "[shadow, full]"). Body uses inline [callout], [label], [macro], and [hr] tags.',
          italics: true, size: 20, color: '666666'
        })]
      }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...body
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Fraud_Flags.docx', buf);
  console.log('Wrote Fraud_Flags.docx (' + buf.length + ' bytes)');
});
