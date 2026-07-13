// build-training-materials.js
// Generates Training_Materials.docx for the Fellowship doc-parser.
// Maps to DOC_IDS.trainingMaterials.
//
// NOTE: The source HTML embeds the slide decks as iframes for inline
// scrolling. The doc parser cannot render iframes, so this version
// provides "open in new tab" links instead. If inline embedding matters,
// keep this page code-driven and pass the slide IDs as config to a
// dedicated TrainingMaterials.html template.

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
function Bullet(pieces) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: buildRuns(pieces)
  });
}
function HR() {
  return new Paragraph({ children: [new TextRun({ text: '[hr]' })] });
}

// ---------- doc content ----------
const body = [];

// ==========================================================
// 1. TUTOR SUPPORT TRAINING (full-width)
// ==========================================================
body.push(H2('Tutor Support Training [evenstar, full]'));
body.push(P(['Core training module for tutor-side support workflows. Review during your first week and revisit periodically as processes update.']));
body.push(HR());
body.push(Label('evenstar', 'Google Slides · Tutor Ops'));
body.push(P([['link', 'Open the Tutor Support Training deck →', 'https://docs.google.com/presentation/d/1I-pNWF39A7U6xCBdcafOTlqraYdQ42-CKJOI1L8QGos/present?slide=id.g2cf66b16bee_0_540']]));

// ==========================================================
// 2. PLATFORM SUPPORT TRAINING (full-width)
// ==========================================================
body.push(H2('Platform Support Training [twilight, full]'));
body.push(P(['Core training module for platform-side support workflows. Review during your first week and revisit periodically as processes update.']));
body.push(HR());
body.push(Label('twilight', 'Google Slides · Platform Ops'));
body.push(P([['link', 'Open the Platform Support Training deck →', 'https://docs.google.com/presentation/d/1CSVVTfkjTymwhH0NGjaro5qKwRx7Zjyd9P4-6ZuzCJo/present?slide=id.g274bce8ed3e_0_0']]));

// ==========================================================
// 3. HOW TO USE (quick reference)
// ==========================================================
body.push(H2('How to Use [hearth]'));
body.push(Label('hearth', 'Navigation'));
body.push(Bullet(['Click either training link above to open the deck in a new tab.']));
body.push(Bullet(['Once open, use the arrow keys (or the Slides controls) to navigate.']));
body.push(Bullet(['Press F11 or use the Slides menu to enter fullscreen presentation mode.']));

// ==========================================================
// 4. TRAINING NOTES (quick reference)
// ==========================================================
body.push(H2('Training Notes [shire]'));
body.push(Label('shire', 'Reminders'));
body.push(Bullet(['Review both decks during your first week.']));
body.push(Bullet(['Revisit periodically as processes update.']));
body.push(Bullet(['Reach out to your Team Lead with any questions.']));

// ---------- document ----------
const doc = new Document({
  creator: 'Fellowship of the Fix',
  title: 'Training Materials',
  description: 'Doc-driven content for the Training Materials page.',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
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
        text: 'Fellowship of the Fix — Training Materials (working draft).',
        bold: true, size: 22
      })] }),
      new Paragraph({ children: [new TextRun({
        text: 'This doc is read by the new web app. NOTE: the source page embeds the slide decks inline via iframes; this doc-driven version replaces those embeds with "open in new tab" links. If inline scrolling matters, keep this page code-driven instead.',
        italics: true, size: 20, color: '666666'
      })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...body
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Training_Materials.docx', buf);
  console.log('Wrote Training_Materials.docx (' + buf.length + ' bytes)');
});
