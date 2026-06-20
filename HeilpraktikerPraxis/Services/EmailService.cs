using HeilpraktikerPraxis.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace HeilpraktikerPraxis.Services;

public class EmailService(PraxisService praxisSvc, PdfService pdfSvc, ZugferdService zugferdSvc)
{
    public async Task SendRechnungAsync(Rechnung rechnung, string empfaengerEmail, string? nachricht = null)
    {
        var praxis = await praxisSvc.GetPraxisDatenAsync();

        if (string.IsNullOrWhiteSpace(praxis.SmtpHost))
            throw new InvalidOperationException("SMTP-Server nicht konfiguriert. Bitte unter Einstellungen eintragen.");
        if (string.IsNullOrWhiteSpace(praxis.SmtpUsername))
            throw new InvalidOperationException("SMTP-Benutzername fehlt.");
        if (string.IsNullOrWhiteSpace(praxis.SmtpPassword))
            throw new InvalidOperationException("SMTP-Passwort fehlt.");

        var pdfBytes = pdfSvc.GenerateRechnung(rechnung, praxis);
        var xmlString = zugferdSvc.GenerateXml(rechnung, praxis);
        var xmlBytes = System.Text.Encoding.UTF8.GetBytes(xmlString);

        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress(praxis.Name, praxis.SmtpUsername));
        mail.To.Add(MailboxAddress.Parse(empfaengerEmail));
        mail.Subject = $"Ihre Rechnung {rechnung.Rechnungsnr}";

        var body = new TextPart("plain")
        {
            Text = BuildEmailText(rechnung, praxis, nachricht)
        };

        var pdf = new MimePart("application", "pdf")
        {
            Content = new MimeContent(new MemoryStream(pdfBytes)),
            ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
            ContentTransferEncoding = ContentEncoding.Base64,
            FileName = $"{rechnung.Rechnungsnr}.pdf"
        };

        var xml = new MimePart("application", "xml")
        {
            Content = new MimeContent(new MemoryStream(xmlBytes)),
            ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
            ContentTransferEncoding = ContentEncoding.Base64,
            FileName = $"{rechnung.Rechnungsnr}_ZUGFeRD.xml"
        };

        mail.Body = new Multipart("mixed") { body, pdf, xml };

        using var smtp = new SmtpClient();
        var secureOption = praxis.SmtpSsl
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.None;
        await smtp.ConnectAsync(praxis.SmtpHost, praxis.SmtpPort, secureOption);
        await smtp.AuthenticateAsync(praxis.SmtpUsername, praxis.SmtpPassword);
        await smtp.SendAsync(mail);
        await smtp.DisconnectAsync(true);
    }

    private static string BuildEmailText(Rechnung rechnung, PraxisDaten praxis, string? nachricht)
    {
        var patient = rechnung.Patient?.VollerName ?? "";
        var anrede = rechnung.Patient?.Anrede is "Herr" ? $"Sehr geehrter Herr {rechnung.Patient.Nachname},"
                   : rechnung.Patient?.Anrede is "Frau" ? $"Sehr geehrte Frau {rechnung.Patient.Nachname},"
                   : $"Sehr geehrte/r {patient},";

        var text = $"""
{anrede}

anbei erhalten Sie Ihre Rechnung {rechnung.Rechnungsnr} vom {rechnung.Ausstellungsdatum:dd.MM.yyyy} über {rechnung.Gesamtbetrag:F2} €.

{(string.IsNullOrWhiteSpace(nachricht) ? "" : nachricht + "\n\n")}Die Rechnung liegt als PDF-Dokument bei. Zusätzlich ist die Rechnung im ZUGFeRD-Format (XML) beigefügt, das von Buchhaltungsprogrammen automatisch verarbeitet werden kann.

Bitte überweisen Sie den Betrag bis zum {rechnung.Faelligkeitsdatum:dd.MM.yyyy} unter Angabe der Rechnungsnummer {rechnung.Rechnungsnr}.
{(string.IsNullOrWhiteSpace(praxis.Iban) ? "" : $"IBAN: {praxis.Iban}{(string.IsNullOrWhiteSpace(praxis.Bic) ? "" : $"  BIC: {praxis.Bic}")}")}

Heilbehandlungen sind gemäß § 4 Nr. 14 UStG von der Umsatzsteuer befreit.

Mit freundlichen Grüßen
{praxis.Inhaberin}
{praxis.Name}
{praxis.Strasse}, {praxis.Plz} {praxis.Ort}
{praxis.Telefon}
""";
        return text;
    }
}
