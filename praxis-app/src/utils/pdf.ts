import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Rechnung, PraxisDaten } from '../types';

export function generateRechnungPDF(rechnung: Rechnung): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const praxis = rechnung.praximDaten;
  const margin = 20;
  const pageW = 210;

  // Farben
  const gruen = [21, 128, 61] as [number, number, number];
  const hellGrau = [245, 247, 245] as [number, number, number];
  const dunkelGrau = [50, 50, 50] as [number, number, number];

  // Header-Balken
  doc.setFillColor(...gruen);
  doc.rect(0, 0, 210, 35, 'F');

  // Praxis-Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(praxis.name || 'Naturheilpraxis', margin, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(praxis.inhaberin || '', margin, 22);
  doc.text(`${praxis.strasse} · ${praxis.plz} ${praxis.ort}`, margin, 28);

  // Kontakt rechts
  doc.text(praxis.telefon || '', pageW - margin, 22, { align: 'right' });
  doc.text(praxis.email || '', pageW - margin, 28, { align: 'right' });

  // Heilpraktiker-Erlaubnis
  doc.setFontSize(8);
  doc.text(praxis.heilpraktikerErlaubnis || 'gem. § 1 HeilprG', pageW - margin, 33, { align: 'right' });

  // Reset Textfarbe
  doc.setTextColor(...dunkelGrau);

  // Empfänger
  let y = 45;
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(`${praxis.name} · ${praxis.strasse} · ${praxis.plz} ${praxis.ort}`, margin, y);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y + 1, 100, y + 1);

  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(...dunkelGrau);
  doc.setFont('helvetica', 'bold');
  doc.text(rechnung.patientName || '', margin, y);
  y += 6;

  // Rechnungs-Info rechts
  const infoX = 130;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setFillColor(...hellGrau);
  doc.roundedRect(infoX - 5, 43, 65, 32, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...gruen);
  doc.text('RECHNUNG', infoX + 27, 50, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...dunkelGrau);
  doc.text('Rechnungsnr.:', infoX, 57);
  doc.setFont('helvetica', 'bold');
  doc.text(rechnung.rechnungsnr, infoX + 55, 57, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Datum:', infoX, 63);
  doc.text(format(new Date(rechnung.ausstellungsdatum), 'dd.MM.yyyy'), infoX + 55, 63, { align: 'right' });

  doc.text('Fällig am:', infoX, 69);
  doc.text(format(new Date(rechnung.faelligkeitsdatum), 'dd.MM.yyyy'), infoX + 55, 69, { align: 'right' });

  // Betreff
  y = 82;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Rechnung ${rechnung.rechnungsnr}`, margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Behandlungsdatum: ${format(new Date(rechnung.ausstellungsdatum), 'dd. MMMM yyyy', { locale: de })}`, margin, y);
  y += 8;

  // Positionen-Tabelle
  autoTable(doc, {
    startY: y,
    head: [['Ziffer', 'Leistung', 'Menge', 'Einzelpreis', 'Gesamtpreis']],
    body: rechnung.positionen.map(pos => [
      pos.ziffer,
      pos.leistung,
      `${pos.anzahl}x`,
      `${pos.einzelpreis.toFixed(2)} €`,
      `${pos.gesamtpreis.toFixed(2)} €`,
    ]),
    styles: { fontSize: 9, cellPadding: 3, textColor: dunkelGrau },
    headStyles: { fillColor: gruen, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 90 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
    },
    alternateRowStyles: { fillColor: hellGrau },
    margin: { left: margin, right: margin },
  });

  const afterTable = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // Summen-Box
  const sumW = 80;
  const sumX = pageW - margin - sumW;
  let sy = afterTable;

  doc.setFillColor(...hellGrau);
  doc.roundedRect(sumX, sy, sumW, rechnung.mwstSatz > 0 ? 28 : 22, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...dunkelGrau);
  sy += 6;
  doc.text('Nettobetrag:', sumX + 4, sy);
  doc.text(`${rechnung.zwischensumme.toFixed(2)} €`, sumX + sumW - 4, sy, { align: 'right' });

  if (rechnung.mwstSatz > 0) {
    sy += 6;
    doc.text(`MwSt. ${rechnung.mwstSatz}%:`, sumX + 4, sy);
    doc.text(`${rechnung.mwstBetrag.toFixed(2)} €`, sumX + sumW - 4, sy, { align: 'right' });
  }

  sy += 6;
  doc.setDrawColor(...gruen);
  doc.line(sumX + 2, sy - 1, sumX + sumW - 2, sy - 1);
  sy += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...gruen);
  doc.text('Gesamtbetrag:', sumX + 4, sy);
  doc.text(`${rechnung.gesamtbetrag.toFixed(2)} €`, sumX + sumW - 4, sy, { align: 'right' });

  // USt-Befreiung
  let notY = afterTable + 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Heilbehandlungen sind gem. § 4 Nr. 14 UStG von der Umsatzsteuer befreit.',
    margin, notY
  );

  // Zahlungshinweis
  if (rechnung.bezahlt) {
    notY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('✓ BEZAHLT', margin, notY);
    if (rechnung.bezahltAm) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(` am ${format(new Date(rechnung.bezahltAm), 'dd.MM.yyyy')} per ${rechnung.zahlungsart || ''}`, margin + 20, notY);
    }
  } else {
    notY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...dunkelGrau);
    doc.text(`Bitte überweisen Sie den Betrag bis zum ${format(new Date(rechnung.faelligkeitsdatum), 'dd.MM.yyyy')} auf folgendes Konto:`, margin, notY);
    notY += 5;
    if (praxis.iban) {
      doc.setFont('helvetica', 'bold');
      doc.text(`IBAN: ${praxis.iban}`, margin, notY);
      if (praxis.bic) {
        notY += 4;
        doc.text(`BIC: ${praxis.bic}`, margin, notY);
      }
      if (praxis.bank) {
        doc.text(`  ${praxis.bank}`, margin + 35, notY);
      }
    }
    notY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(`Verwendungszweck: ${rechnung.rechnungsnr}`, margin, notY);
  }

  // Grußformel
  notY += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...dunkelGrau);
  doc.text('Mit freundlichen Grüßen', margin, notY);
  notY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(praxis.inhaberin || praxis.name, margin, notY);

  // Footer
  const footerY = 280;
  doc.setDrawColor(...gruen);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 130, 130);
  const footerParts = [praxis.name, praxis.strasse, `${praxis.plz} ${praxis.ort}`, praxis.telefon, praxis.email].filter(Boolean);
  doc.text(footerParts.join(' · '), pageW / 2, footerY + 5, { align: 'center' });
  if (praxis.steuernr) {
    doc.text(`Steuernummer: ${praxis.steuernr}`, pageW / 2, footerY + 9, { align: 'center' });
  }

  return doc;
}

export function downloadRechnungPDF(rechnung: Rechnung) {
  const doc = generateRechnungPDF(rechnung);
  doc.save(`${rechnung.rechnungsnr}.pdf`);
}
