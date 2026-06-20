namespace HeilpraktikerPraxis.Models;

public class PraxisDaten
{
    public int Id { get; set; }
    public string Name { get; set; } = "Naturheilpraxis";
    public string Inhaberin { get; set; } = "";
    public string Strasse { get; set; } = "";
    public string Plz { get; set; } = "";
    public string Ort { get; set; } = "";
    public string Telefon { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Webseite { get; set; }
    public string? Steuernr { get; set; }
    public string? UstIdNr { get; set; }
    public string? Iban { get; set; }
    public string? Bic { get; set; }
    public string? Bank { get; set; }
    public string? HeilpraktikerErlaubnis { get; set; } = "gem. § 1 HeilprG";
    public byte[]? Logo { get; set; }

    // E-Mail / SMTP
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public bool SmtpSsl { get; set; } = true;
}
