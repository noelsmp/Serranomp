namespace PatientenPortal.Data.Models;

public class Registrierung
{
    public string Id { get; set; } = string.Empty;
    public string Vorname { get; set; } = string.Empty;
    public string Nachname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime Geburtsdatum { get; set; }
    public string? Telefon { get; set; }
    public bool DatenschutzZugestimmt { get; set; }
    public bool NutzungsbedingungenZugestimmt { get; set; }
    public string Status { get; set; } = "ausstehend";
    public DateTime Erstellt { get; set; } = DateTime.UtcNow;
    public DateTime? BearbeitetAm { get; set; }
    public string? BearbeitetVon { get; set; }
    public string Token { get; set; } = string.Empty;
}
