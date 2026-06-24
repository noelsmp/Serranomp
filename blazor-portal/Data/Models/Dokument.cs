namespace PatientenPortal.Data.Models;

public class Dokument
{
    public string Id { get; set; } = string.Empty;
    public string PatientId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Kategorie { get; set; } = "sonstiges";
    public string Dateipfad { get; set; } = string.Empty;
    public long Dateigroesse { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string HochgeladenVon { get; set; } = "praxis";
    public string? HochgeladenVonName { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.UtcNow;

    public Benutzer? Patient { get; set; }
    public Rechnung? Rechnung { get; set; }
}
