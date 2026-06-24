namespace PatientenPortal.Data.Models;

public class Benutzer
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswortHash { get; set; } = string.Empty;
    public string Vorname { get; set; } = string.Empty;
    public string Nachname { get; set; } = string.Empty;
    public DateTime? Geburtsdatum { get; set; }
    public string? Telefon { get; set; }
    public string Rolle { get; set; } = "patient";
    public string Status { get; set; } = "aktiv";
    public string? PraxisPatientNr { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.UtcNow;
    public DateTime? LetzterLogin { get; set; }

    public ICollection<Dokument> Dokumente { get; set; } = new List<Dokument>();
    public ICollection<Rechnung> Rechnungen { get; set; } = new List<Rechnung>();
    public ICollection<DsgvoAnfrage> DsgvoAnfragen { get; set; } = new List<DsgvoAnfrage>();
    public ICollection<PasswortResetToken> PasswortResetTokens { get; set; } = new List<PasswortResetToken>();
}
