using HeilpraktikerPraxis.Models;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Filespec;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HeilpraktikerPraxis.Services;

public class PdfService
{
    // Erzeugt ein ZUGFeRD-konformes PDF: QuestPDF-Dokument + eingebettete Factur-X XML
    public byte[] GenerateZugferdRechnung(Rechnung rechnung, PraxisDaten praxis, string zugferdXml)
    {
        var pdfBytes = GenerateRechnung(rechnung, praxis);
        var xmlBytes = System.Text.Encoding.UTF8.GetBytes(zugferdXml);
        return EmbedZugferdXml(pdfBytes, xmlBytes);
    }

    private static byte[] EmbedZugferdXml(byte[] pdfBytes, byte[] xmlBytes)
    {
        using var input = new MemoryStream(pdfBytes);
        using var output = new MemoryStream();

        var reader = new PdfReader(input);
        var writer = new PdfWriter(output);
        using var doc = new PdfDocument(reader, writer);

        var fileSpec = PdfFileSpec.CreateEmbeddedFileSpec(
            doc,
            xmlBytes,
            "ZUGFeRD/Factur-X Rechnung",
            "factur-x.xml",
            new PdfName("text/xml"),
            null,
            PdfName.Alternative);

        doc.AddFileAttachment("factur-x.xml", fileSpec);

        // AF-Eintrag für PDF/A-3 Associated Files
        var af = new PdfArray();
        af.Add(fileSpec.GetPdfObject());
        doc.GetCatalog().Put(new PdfName("AF"), af);

        doc.Close();
        return output.ToArray();
    }

    public byte[] GenerateRechnung(Rechnung rechnung, PraxisDaten praxis)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                page.Header().Element(c => Header(c, praxis));
                page.Content().Element(c => Content(c, rechnung, praxis));
                page.Footer().Element(c => Footer(c, praxis));
            });
        });

        return doc.GeneratePdf();
    }

    private static void Header(IContainer c, PraxisDaten praxis)
    {
        c.Column(col =>
        {
            col.Item().Background("#15803d").Padding(15).Row(row =>
            {
                row.RelativeItem().Column(inner =>
                {
                    inner.Item().Text(praxis.Name).FontSize(18).FontColor(Colors.White).Bold();
                    inner.Item().Text(praxis.Inhaberin).FontColor(Colors.White);
                    inner.Item().Text($"{praxis.Strasse} · {praxis.Plz} {praxis.Ort}").FontColor(Colors.White).FontSize(9);
                });
                row.AutoItem().Column(inner =>
                {
                    inner.Item().AlignRight().Text(praxis.Telefon).FontColor(Colors.White).FontSize(9);
                    inner.Item().AlignRight().Text(praxis.Email).FontColor(Colors.White).FontSize(9);
                    if (!string.IsNullOrEmpty(praxis.HeilpraktikerErlaubnis))
                        inner.Item().AlignRight().Text(praxis.HeilpraktikerErlaubnis).FontColor(Colors.White).FontSize(8);
                });
            });
        });
    }

    private static void Content(IContainer c, Rechnung rechnung, PraxisDaten praxis)
    {
        c.Column(col =>
        {
            col.Spacing(15);

            // Empfänger + Rechnungsinfo
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(inner =>
                {
                    inner.Item().Text($"{praxis.Name} · {praxis.Strasse} · {praxis.Plz} {praxis.Ort}")
                        .FontSize(8).FontColor(Colors.Grey.Darken2);
                    inner.Item().PaddingTop(5).Text(rechnung.Patient?.VollerName ?? "").FontSize(12).Bold();
                });
                row.ConstantItem(170).Background("#f5f7f5").Padding(10).Column(inner =>
                {
                    inner.Item().AlignCenter().Text("RECHNUNG").FontSize(14).Bold().FontColor("#15803d");
                    inner.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text("Rechnungsnr.:").FontSize(9);
                        r.RelativeItem().AlignRight().Text(rechnung.Rechnungsnr).FontSize(9).Bold();
                    });
                    inner.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Datum:").FontSize(9);
                        r.RelativeItem().AlignRight().Text(rechnung.Ausstellungsdatum.ToString("dd.MM.yyyy")).FontSize(9);
                    });
                    inner.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Fällig am:").FontSize(9);
                        r.RelativeItem().AlignRight().Text(rechnung.Faelligkeitsdatum.ToString("dd.MM.yyyy")).FontSize(9);
                    });
                });
            });

            // Betreff
            col.Item().Text($"Rechnung {rechnung.Rechnungsnr}").FontSize(13).Bold();
            col.Item().Text($"Behandlungsdatum: {rechnung.Ausstellungsdatum:dd. MMMM yyyy}").FontSize(9).FontColor(Colors.Grey.Darken2);

            // Tabelle
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    cols.ConstantColumn(45);
                    cols.RelativeColumn(3);
                    cols.ConstantColumn(45);
                    cols.ConstantColumn(65);
                    cols.ConstantColumn(65);
                });

                // Header
                var headerStyle = TextStyle.Default.FontSize(9).FontColor(Colors.White).Bold();
                table.Header(h =>
                {
                    h.Cell().Background("#15803d").Padding(5).Text("Ziffer").Style(headerStyle);
                    h.Cell().Background("#15803d").Padding(5).Text("Leistung").Style(headerStyle);
                    h.Cell().Background("#15803d").Padding(5).AlignCenter().Text("Menge").Style(headerStyle);
                    h.Cell().Background("#15803d").Padding(5).AlignRight().Text("Einzelpreis").Style(headerStyle);
                    h.Cell().Background("#15803d").Padding(5).AlignRight().Text("Gesamt").Style(headerStyle);
                });

                // Zeilen
                foreach (var (pos, idx) in rechnung.Positionen.Select((p, i) => (p, i)))
                {
                    string bg = idx % 2 == 0 ? Colors.White : "#f5f7f5";
                    table.Cell().Background(bg).Padding(5).Text(pos.Ziffer).FontSize(9);
                    table.Cell().Background(bg).Padding(5).Text(pos.Leistung).FontSize(9);
                    table.Cell().Background(bg).Padding(5).AlignCenter().Text($"{pos.Anzahl}x").FontSize(9);
                    table.Cell().Background(bg).Padding(5).AlignRight().Text($"{pos.Einzelpreis:F2} €").FontSize(9);
                    table.Cell().Background(bg).Padding(5).AlignRight().Text($"{pos.Gesamtpreis:F2} €").FontSize(9);
                }
            });

            // Summe
            col.Item().AlignRight().Width(170).Column(sum =>
            {
                sum.Item().Background("#f5f7f5").Padding(10).Column(inner =>
                {
                    inner.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Nettobetrag:").FontSize(9);
                        r.AutoItem().Text($"{rechnung.Zwischensumme:F2} €").FontSize(9);
                    });
                    if (rechnung.MwstSatz > 0)
                    {
                        inner.Item().Row(r =>
                        {
                            r.RelativeItem().Text($"MwSt. {rechnung.MwstSatz}%:").FontSize(9);
                            r.AutoItem().Text($"{rechnung.MwstBetrag:F2} €").FontSize(9);
                        });
                    }
                    inner.Item().LineHorizontal(1).LineColor("#15803d");
                    inner.Item().PaddingTop(3).Row(r =>
                    {
                        r.RelativeItem().Text("Gesamtbetrag:").FontSize(11).Bold().FontColor("#15803d");
                        r.AutoItem().Text($"{rechnung.Gesamtbetrag:F2} €").FontSize(11).Bold().FontColor("#15803d");
                    });
                });
            });

            // USt-Befreiung
            col.Item().Text("Heilbehandlungen sind gem. § 4 Nr. 14 UStG von der Umsatzsteuer befreit.")
                .FontSize(8).FontColor(Colors.Grey.Darken1).Italic();

            // Zahlungshinweis
            if (rechnung.Bezahlt)
            {
                col.Item().Background("#f0fdf4").BorderLeft(3).BorderColor("#15803d").Padding(8)
                    .Text($"✓ BEZAHLT am {rechnung.BezahltAm:dd.MM.yyyy} per {rechnung.Zahlungsart}")
                    .FontColor("#15803d").Bold();
            }
            else if (!string.IsNullOrEmpty(praxis.Iban))
            {
                col.Item().Column(pay =>
                {
                    pay.Item().Text($"Bitte überweisen Sie den Betrag bis zum {rechnung.Faelligkeitsdatum:dd.MM.yyyy} auf folgendes Konto:").FontSize(9);
                    pay.Item().Text($"IBAN: {praxis.Iban}  BIC: {praxis.Bic}  {praxis.Bank}").FontSize(9).Bold();
                    pay.Item().Text($"Verwendungszweck: {rechnung.Rechnungsnr}").FontSize(9);
                });
            }

            // Grußformel
            col.Item().PaddingTop(10).Column(gruss =>
            {
                gruss.Item().Text("Mit freundlichen Grüßen").FontSize(9);
                gruss.Item().PaddingTop(8).Text(praxis.Inhaberin).Bold();
            });
        });
    }

    private static void Footer(IContainer c, PraxisDaten praxis)
    {
        c.Column(col =>
        {
            col.Item().LineHorizontal(1).LineColor("#15803d");
            col.Item().PaddingTop(4).AlignCenter().Text(text =>
            {
                var parts = new[] { praxis.Name, praxis.Strasse, $"{praxis.Plz} {praxis.Ort}", praxis.Telefon, praxis.Email }
                    .Where(s => !string.IsNullOrEmpty(s));
                text.Span(string.Join(" · ", parts)).FontSize(8).FontColor(Colors.Grey.Darken1);
            });
            if (!string.IsNullOrEmpty(praxis.Steuernr))
                col.Item().AlignCenter().Text($"Steuernummer: {praxis.Steuernr}").FontSize(8).FontColor(Colors.Grey.Darken1);
        });
    }
}
