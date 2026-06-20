window.praxisPdf = {
    _build: function (rechnung, praxis) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const W = 210, M = 20;
        const green = [21, 128, 61], gray = [107, 114, 128], lightGray = [245, 247, 245], lightGreen = [240, 253, 244];

        const fmtEur = v => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v || 0);
        const fmtDate = s => { if (!s) return ''; const d = new Date(s); return isNaN(d) ? s : `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; };

        // HEADER
        doc.setFillColor(...green);
        doc.rect(0, 0, W, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18); doc.setFont('helvetica', 'bold');
        doc.text(praxis.name || 'Naturheilpraxis', M, 14);
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.text(praxis.inhaberin || '', M, 21);
        doc.text([praxis.strasse, `${praxis.plz || ''} ${praxis.ort || ''}`].filter(Boolean).join(' · '), M, 27);
        doc.setFontSize(9);
        if (praxis.telefon) doc.text(praxis.telefon, W - M, 14, { align: 'right' });
        if (praxis.email) doc.text(praxis.email, W - M, 20, { align: 'right' });
        if (praxis.heilpraktikerErlaubnis) doc.text(praxis.heilpraktikerErlaubnis, W - M, 26, { align: 'right' });

        let y = 50;

        // SENDER LINE
        doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        doc.text([praxis.name, praxis.strasse, `${praxis.plz || ''} ${praxis.ort || ''}`].filter(Boolean).join(' · '), M, y);
        y += 5;

        // PATIENT
        const p = rechnung.patient || {};
        doc.setTextColor(0, 0, 0); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text([p.anrede, p.vorname, p.nachname].filter(Boolean).join(' '), M, y + 5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        if (p.strasse) doc.text(p.strasse, M, y + 11);
        if (p.plz || p.ort) doc.text(`${p.plz || ''} ${p.ort || ''}`, M, y + 17);

        // INVOICE INFO BOX
        const bx = W - M - 65, by = y - 2, bw = 65, bh = 36;
        doc.setFillColor(...lightGray); doc.rect(bx, by, bw, bh, 'F');
        doc.setTextColor(...green); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('RECHNUNG', bx + bw / 2, by + 10, { align: 'center' });
        doc.setTextColor(0, 0, 0); doc.setFontSize(8);
        const ausst = fmtDate(rechnung.ausstellungsdatum), faellig = fmtDate(rechnung.faelligkeitsdatum);
        [['Nr.:', rechnung.rechnungsnr || ''], ['Datum:', ausst], ['Fällig:', faellig]].forEach(([k, v], i) => {
            const ly = by + 18 + i * 6;
            doc.setFont('helvetica', 'bold'); doc.text(k, bx + 3, ly);
            doc.setFont('helvetica', 'normal'); doc.text(v, bx + bw - 3, ly, { align: 'right' });
        });

        y += 46;

        // SUBJECT
        doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text(`Rechnung ${rechnung.rechnungsnr || ''}`, M, y); y += 6;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray);
        doc.text(`Behandlungsdatum: ${ausst}`, M, y); y += 10;

        // TABLE
        const positionen = rechnung.positionen || [];
        const cols = [M, M+22, M+102, M+120, M+147];
        const tableH = 8;
        doc.setFillColor(...green); doc.rect(M, y, 170, tableH, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        ['Ziffer','Leistung','Menge','Einzelpr.','Gesamt'].forEach((h, i) => {
            const align = i >= 2 ? 'right' : 'left';
            const x = i >= 2 ? [cols[2]+18, cols[3]+23, cols[4]+23][i-2] : cols[i]+1;
            doc.text(h, x, y + 5.5, { align });
        });
        y += tableH;

        doc.setTextColor(0, 0, 0);
        positionen.forEach((pos, idx) => {
            if (idx % 2 === 1) { doc.setFillColor(...lightGray); doc.rect(M, y, 170, tableH, 'F'); }
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            doc.text(pos.ziffer || '', cols[0]+1, y+5.5);
            const lText = doc.splitTextToSize(pos.leistung || '', 78)[0];
            doc.text(lText, cols[1]+1, y+5.5);
            doc.text(`${pos.anzahl}×`, cols[2]+18, y+5.5, { align: 'right' });
            doc.text(fmtEur(pos.einzelpreis), cols[3]+23, y+5.5, { align: 'right' });
            doc.setFont('helvetica', 'bold');
            doc.text(fmtEur(pos.anzahl * pos.einzelpreis), cols[4]+23, y+5.5, { align: 'right' });
            y += tableH;
        });

        y += 8;

        // TOTALS
        const sx = W - M - 68;
        doc.setFillColor(...lightGray); doc.rect(sx, y, 68, 34, 'F');
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0,0,0);
        doc.text('Nettobetrag:', sx+3, y+8); doc.text(fmtEur(rechnung.zwischensumme), sx+65, y+8, { align:'right' });
        doc.text('MwSt. (§ 4 Nr. 14 UStG):', sx+3, y+15); doc.text('0,00 €', sx+65, y+15, { align:'right' });
        doc.setDrawColor(...green); doc.line(sx+3, y+18, sx+65, y+18);
        doc.setTextColor(...green); doc.setFontSize(11); doc.setFont('helvetica','bold');
        doc.text('Gesamtbetrag:', sx+3, y+27); doc.text(fmtEur(rechnung.gesamtbetrag), sx+65, y+27, { align:'right' });
        y += 42;

        // USt NOTE
        doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica','italic');
        doc.text('Heilbehandlungen sind gem. § 4 Nr. 14 UStG von der Umsatzsteuer befreit.', M, y);
        y += 10;

        // PAYMENT
        if (rechnung.bezahlt) {
            doc.setFillColor(...lightGreen); doc.setDrawColor(...green);
            doc.rect(M, y, 170, 12, 'FD');
            doc.setTextColor(...green); doc.setFontSize(10); doc.setFont('helvetica','bold');
            doc.text(`BEZAHLT am ${fmtDate(rechnung.bezahltAm)} per ${rechnung.zahlungsart||''}`, M+5, y+8);
            y += 20;
        } else if (praxis.iban) {
            doc.setTextColor(0,0,0); doc.setFontSize(9); doc.setFont('helvetica','normal');
            doc.text(`Bitte überweisen Sie den Betrag bis zum ${faellig} auf folgendes Konto:`, M, y); y+=6;
            doc.setFont('helvetica','bold');
            doc.text(`IBAN: ${praxis.iban}  BIC: ${praxis.bic||''}  ${praxis.bank||''}`, M, y); y+=6;
            doc.text(`Verwendungszweck: ${rechnung.rechnungsnr||''}`, M, y); y+=14;
        }

        // GREETING
        doc.setTextColor(0,0,0); doc.setFontSize(9); doc.setFont('helvetica','normal');
        doc.text('Mit freundlichen Grüßen', M, y); y+=10;
        doc.setFont('helvetica','bold'); doc.text(praxis.inhaberin||'', M, y);

        // FOOTER
        doc.setDrawColor(...green); doc.line(M, 280, W-M, 280);
        doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica','normal');
        const footerParts = [praxis.name, praxis.strasse, `${praxis.plz||''} ${praxis.ort||''}`, praxis.telefon, praxis.email].filter(Boolean);
        doc.text(footerParts.join(' · '), W/2, 285, { align:'center' });
        if (praxis.steuernr) doc.text(`Steuernummer: ${praxis.steuernr}`, W/2, 291, { align:'center' });

        return doc;
    },

    downloadRechnung: function (rechnung, praxis) {
        const doc = window.praxisPdf._build(rechnung, praxis);
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.target = '_blank';
        a.download = `${rechnung.rechnungsnr || 'Rechnung'}.pdf`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    },

    downloadZugferd: async function (rechnung, praxis, xmlString) {
        const doc = window.praxisPdf._build(rechnung, praxis);
        const pdfBytes = doc.output('arraybuffer');
        const xmlBytes = new TextEncoder().encode(xmlString);

        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.load(pdfBytes);
        await pdfDoc.attach(xmlBytes, 'factur-x.xml', {
            mimeType: 'text/xml',
            description: 'ZUGFeRD/Factur-X Invoice',
            creationDate: new Date(),
            modificationDate: new Date(),
        });
        const merged = await pdfDoc.save();

        const blob = new Blob([merged], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.target = '_blank';
        a.download = `${rechnung.rechnungsnr || 'Rechnung'}_ZUGFeRD.pdf`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    },

    downloadBase64File: function (name, mimeType, base64Data) {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
};
