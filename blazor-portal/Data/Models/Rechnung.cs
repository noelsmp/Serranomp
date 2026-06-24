namespace PatientenPortal.Data.Models;

public class Rechnung
{
    public string Id { get; set; } = string.Empty;
    public string PatientId { get; set; } = string.Empty;
    public string Rechnungsnr { get; set; } = string.Empty;
    public DateTime Ausstellungsdatum { get; set; }
    public DateTime Faelligkeitsdatum { get; set; }
    public decimal Gesamtbetrag { get; set; }
    public bool Bezahlt { get; set; }
    public DateTime? BezahltAm { get; set; }
    public string? DokumentId { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.UtcNow;

    public Benutzer? Patient { get; set; }
    public Dokument? Dokument { get; set; }
}
