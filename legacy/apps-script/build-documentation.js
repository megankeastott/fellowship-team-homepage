// build-documentation.js
// Generates Documentation.docx for the Fellowship doc-parser.
// Maps to DOC_IDS.documentation.

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
function Label(color, text) {
  return new Paragraph({
    children: [new TextRun({ text: '[label ' + color + ']' + text + '[/label]' })]
  });
}
function HR() {
  return new Paragraph({ children: [new TextRun({ text: '[hr]' })] });
}

// Helper: an "Additional Resources" card — label + link only.
function ResourceCard(title, color, labelText, linkText, linkUrl) {
  return [
    H2(title + ' [' + color + ']'),
    Label(color, labelText),
    P([['link', linkText, linkUrl]])
  ];
}

// ---------- doc content ----------
const body = [];

// ==========================================================
// SECTION 1: ZENDESK KNOWLEDGE
// ==========================================================
body.push(H1('Zendesk Knowledge [door]'));

body.push(H2('Core References [earthen, full]'));
body.push(P(['The two canonical references for day-to-day operations work. Bookmark both.']));
body.push(Label('hearth', 'Internal Portal'));
body.push(P([
  ['link', 'Knowledge Base', 'https://vtteinternal.varsitytutors.com/hc/en-us'],
  ' — VT Internal Help Center; all team information and articles.'
]));
body.push(HR());
body.push(Label('evenstar', 'Playbook'));
body.push(P([
  ['link', 'The Playbook', 'https://docs.google.com/document/d/1ZQYBujA6ES0U4cVzSLNq1ZT6ss0u6Mu8pfYd9hpnNAA/edit?usp=sharing'],
  ' — comprehensive operations reference, organized by section.'
]));

// ==========================================================
// SECTION 2: ADDITIONAL RESOURCES
// ==========================================================
body.push(H1('Additional Resources [quill]'));

// 10 small single-link cards. Colors alternate to avoid same-realm adjacency.
body.push(...ResourceCard('Incentives', 'hearth', 'Guide',
  'Incentive V2 Guide',
  'https://docs.google.com/document/d/1upGu1_HQRgwbrnG2O9D8-vRximPk9mNzV1rm6WxGZI8/edit?tab=t.0#heading=h.arv2qwyrmpd8'));

body.push(...ResourceCard('Reactivation', 'twilight', 'Matrix',
  'Tutor Reactivation Review Matrix',
  'https://docs.google.com/spreadsheets/d/15XvmdIZ4wSni81QKqcv0gYQV9L6CVRXKuwle_8lvfeo/edit?gid=0#gid=0'));

body.push(...ResourceCard('Rates', 'shire', 'Reference',
  'All City Rates',
  'https://docs.google.com/spreadsheets/d/1Sr469QMaDnYXLlMqxenlniqdFxRNvuNsnGyb6vJgZyU/edit?gid=792557734#gid=792557734'));

body.push(...ResourceCard('Invoicing', 'shadow', 'Process',
  'Automated Invoicing',
  'https://docs.google.com/document/d/1NbTjnq3TpzD_hn62sNd8OBDeg9rakxCR5Z3nJbwK5fo/edit?tab=t.b1hza5dbblrc#heading=h.iy0j9tad85mb'));

body.push(...ResourceCard('PII Handling', 'earthen', 'SOP',
  'PII Handling SOP',
  'https://docs.google.com/document/d/1hyWTHax4hxknYdodo0byxCk9h2bRqls0Ba57M36f1co/edit?usp=sharing'));

body.push(...ResourceCard('VT4S', 'evenstar', 'FAQ',
  'VT4S FAQ',
  'https://docs.google.com/document/d/1VP90V18TS0OWihBzd0GhitbxvrshPi2VZwOMu_wNoBs/edit?tab=t.0#heading=h.i1bonxyroalz'));

body.push(...ResourceCard('Email Management', 'hearth', 'Policy',
  'Client & Student Email Management',
  'https://docs.google.com/document/d/1tlUCkUp5WszUjBqQlUCB9HT83iny6okJYtdAaltB0mo/edit?tab=t.0#heading=h.w3rszkqvir8c'));

body.push(...ResourceCard('Device Specs', 'twilight', 'Technical',
  'Recommended Device Specs',
  'https://docs.google.com/document/d/19VNQpCGoEvmcc3HNrBbFCrHveO2LTIIYwDKYPEHlTpc/edit?tab=t.0#heading=h.7eaicvf3ha66'));

body.push(...ResourceCard('Escalations', 'shadow', 'SOP',
  'Escalation SOP',
  'https://docs.google.com/document/d/1UcDTj5HjeafvJmPgnnJeQydzpeJee-82-2FKeopDzgM/edit?tab=t.0#heading=h.pck32mcswvdi'));

body.push(...ResourceCard('Co-Pilot', 'shire', 'Guide',
  'Co-Pilot (CAL) Guide',
  'https://docs.google.com/document/d/19FnkjhRszln8Ew9k8W2Sg7b8ZTejamGuhENhwTRFirA/edit?tab=t.0#heading=h.pqcokhphqvtu'));

// ---------- document ----------
const doc = new Document({
  creator: 'Fellowship of the Fix',
  title: 'Documentation',
  description: 'Doc-driven content for the Documentation (Resources) page.',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '4a7a3a' },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '7a5a30' },
        paragraph: { spacing: { before: 320, after: 100 }, outlineLevel: 1 } }
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
      page: { size: { width: 12240, height: 15840 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    children: [
      new Paragraph({ children: [new TextRun({
        text: 'Fellowship of the Fix — Documentation (working draft).',
        bold: true, size: 22
      })] }),
      new Paragraph({ children: [new TextRun({
        text: 'This doc is read by the new web app. Heading 1 starts a section with an optional icon (e.g. "[door]"). Heading 2 starts a card; bracket suffix sets color and width (e.g. "[earthen, full]").',
        italics: true, size: 20, color: '666666'
      })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...body
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Documentation.docx', buf);
  console.log('Wrote Documentation.docx (' + buf.length + ' bytes)');
});
