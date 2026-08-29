'use strict';
const {
  Document, Packer, Paragraph, Table, TableRow, TableCell, ImageRun, TextRun,
  WidthType, HeightRule, VerticalAlign, BorderStyle, AlignmentType,
  TabStopType, PositionalTabLeader
} = require('docx');
const fs = require('fs');

const logo = fs.readFileSync('/home/user/Serranomp/logo.png');

// Logo: 600×400px → 3:2 ratio
// Units
const dxa = n => Math.round(n * 56.69);  // mm → DXA
const emu = n => Math.round(n * 36000);  // mm → EMU

// Logo display: 44mm wide, ~29mm tall
const LOGO_W = emu(44);
const LOGO_H = emu(44 / 1.5);  // ≈29mm

const CARD_W  = dxa(85);
const CARD_H  = dxa(55);
const SPACER  = dxa(8);
const MARGIN  = dxa(3.5);
const TAB_POS = CARD_W - MARGIN * 2 - dxa(1);

const TEAL = '1A6374';
const GOLD = 'B08850';
const MUTED = '7E7568';

const cut = { style: BorderStyle.DASHED, size: 6, color: 'BDB5AA' };
const off = { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' };

function card() {
  return new TableCell({
    width: { size: CARD_W, type: WidthType.DXA },
    margins: { top: dxa(2), bottom: 0, left: MARGIN, right: MARGIN },
    verticalAlign: VerticalAlign.TOP,
    borders: { top: cut, bottom: cut, left: cut, right: cut },
    children: [
      // Logo
      new Paragraph({
        spacing: { before: 0, after: dxa(1.5) },
        children: [
          new ImageRun({
            data: logo,
            type: 'png',
            transformation: { width: LOGO_W, height: LOGO_H },
          }),
        ],
      }),

      // Label
      new Paragraph({
        spacing: { before: 0, after: dxa(2) },
        children: [
          new TextRun({ text: 'IHR NÄCHSTER TERMIN', size: 12, bold: true, color: TEAL, characterSpacing: 80 }),
        ],
      }),

      // Datum
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TAB_POS, leader: PositionalTabLeader.UNDERSCORE }],
        spacing: { before: 0, after: dxa(2) },
        children: [
          new TextRun({ text: 'Datum', size: 16, color: MUTED }),
          new TextRun({ text: '\t' }),
        ],
      }),

      // Uhrzeit
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TAB_POS, leader: PositionalTabLeader.UNDERSCORE }],
        spacing: { before: 0, after: dxa(1.5) },
        children: [
          new TextRun({ text: 'Uhrzeit', size: 16, color: MUTED }),
          new TextRun({ text: '\t' }),
        ],
      }),

      // Cancellation note with gold bottom border
      new Paragraph({
        spacing: { before: 0, after: dxa(1.5) },
        border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: GOLD, space: 3 } },
        children: [
          new TextRun({
            text: 'Bei Verhinderung bitten wir um frühzeitige Absage.',
            size: 11, italics: true, color: MUTED,
          }),
        ],
      }),

      // Footer
      new Paragraph({
        spacing: { before: dxa(1.5), after: 0 },
        children: [
          new TextRun({ text: 'Homberger Straße 348  ·  0176 22923179', size: 13, color: MUTED }),
        ],
      }),
    ],
  });
}

function spacer() {
  return new TableCell({
    width: { size: SPACER, type: WidthType.DXA },
    borders: { top: off, bottom: off, left: off, right: off },
    children: [new Paragraph({ children: [] })],
  });
}

function row() {
  return new TableRow({
    height: { value: CARD_H, rule: HeightRule.EXACT },
    children: [card(), spacer(), card()],
  });
}

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: dxa(210), height: dxa(297) },
        margin: { top: dxa(12), bottom: dxa(12), left: dxa(10), right: dxa(10) },
      },
    },
    children: [
      new Table({
        width: { size: CARD_W + SPACER + CARD_W, type: WidthType.DXA },
        columnWidths: [CARD_W, SPACER, CARD_W],
        rows: [row(), row(), row(), row()],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = '/home/user/Serranomp/Terminkarten.docx';
  fs.writeFileSync(out, buf);
  console.log('OK:', out);
}).catch(err => { console.error(err); process.exit(1); });
