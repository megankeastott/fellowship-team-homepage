// build-micro-trainings.js
// Generates Micro_Trainings.docx for the Fellowship doc-parser.
// Maps to DOC_IDS.microTrainings.
//
// Each "scroll" in the source becomes a card. The decorative wax-seal
// "Break Seal" button is rendered as a plain hyperlink — the seal styling
// was decorative, not functional.

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
function P(pieces) {
  return new Paragraph({ children: buildRuns(pieces) });
}
function Label(color, text) {
  return new Paragraph({
    children: [new TextRun({ text: '[label ' + color + ']' + text + '[/label]' })]
  });
}
function HR() {
  return new Paragraph({ children: [new TextRun({ text: '[hr]' })] });
}

// ---------- doc content ----------
const body = [];

// ==========================================================
// 1. LLP2 TRAINING (2 parts, full-width)
// ==========================================================
body.push(H2('LLP2 Training [shire, full]'));
body.push(P([['i', 'Two-part lesson.']]));
body.push(P(['Everything you need to know about the LLP2 launch — product overview and A/V walkthrough.']));
body.push(HR());
body.push(Label('shire', 'Part 1 — LLP2 Launch'));
body.push(P([['link', 'Watch on Loom →', 'https://www.loom.com/share/b546aecd086847f7b9b826029712931c']]));
body.push(Label('shire', 'Part 2 — LLP2 A/V'));
body.push(P([['link', 'Watch on Loom →', 'https://www.loom.com/share/bd747fee25ab42c1bb97d396f23e8419']]));

// ==========================================================
// 2. CREATE A TIER 3
// ==========================================================
body.push(H2('Create a Tier 3 [evenstar]'));
body.push(P(['Step-by-step walkthrough of creating a Tier 3 escalation ticket.']));
body.push(P([['link', 'Watch on Loom →', 'https://www.loom.com/share/2f9ad67ea85a48e9b7fdbba1ef04b422']]));

// ==========================================================
// 3. LINK A MASTERTICKET
// ==========================================================
body.push(H2('Link a Masterticket [twilight]'));
body.push(P(['How to find and link a masterticket to related support tickets.']));
body.push(P([['link', 'Watch on Drive →', 'https://drive.google.com/file/d/1KHclz_6yW8VKdcuR-JaqO6zmmAwhR359/view']]));

// ==========================================================
// 4. NAVIGATE THE KNOWLEDGE BASE
// ==========================================================
body.push(H2('Navigate the Knowledge Base [shadow]'));
body.push(P(['Tips and tricks for efficiently searching and navigating the knowledge base.']));
body.push(P([['link', 'Watch on Drive →', 'https://drive.google.com/file/d/1atO2upOrzNz-ld0kC4iVo1FkALqIbPnd/view']]));

// ==========================================================
// 5. HOW TO USE CAL (2 parts, full-width)
// ==========================================================
body.push(H2('How to Use Cal [hearth, full]'));
body.push(P([['i', 'Two-part lesson.']]));
body.push(P(['Complete guide to using Cal — from the basics through advanced workflows.']));
body.push(HR());
body.push(Label('hearth', 'Part 1 — Cal Basics'));
body.push(P([['link', 'Watch on Loom →', 'https://www.loom.com/share/d5ba499ff80740e0aeb584cf92a61047']]));
body.push(Label('hearth', 'Part 2 — Advanced Cal'));
body.push(P([['link', 'Watch on Loom →', 'https://www.loom.com/share/cf5f501cbeec4d8285beb45bbf6239c6']]));

// ---------- document ----------
const doc = new Document({
  creator: 'Fellowship of the Fix',
  title: 'Micro Trainings',
  description: 'Doc-driven content for the Micro Trainings page.',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '4a7a3a' },
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
      page: { size: { width: 12240, height: 15840 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    children: [
      new Paragraph({ children: [new TextRun({
        text: 'Fellowship of the Fix — Micro Trainings (working draft).',
        bold: true, size: 22
      })] }),
      new Paragraph({ children: [new TextRun({
        text: 'This doc is read by the new web app. Each Heading 2 is a training scroll; "full" in the bracket suffix gives it the full grid width (used for two-part lessons).',
        italics: true, size: 20, color: '666666'
      })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...body
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Micro_Trainings.docx', buf);
  console.log('Wrote Micro_Trainings.docx (' + buf.length + ' bytes)');
});
