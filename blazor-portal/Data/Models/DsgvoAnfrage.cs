namespace PatientenPortal.Data.Models;

public class DsgvoAnfrage
{
    public string Id { get; set; } = string.Empty;
    public string PatientId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Typ { get; set; } = "auskunft";
    public string? Nachricht { get; set; }
    public bool Bearbeitet { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.UtcNow;

    public Benutzer? Patient { get; set; }
}
