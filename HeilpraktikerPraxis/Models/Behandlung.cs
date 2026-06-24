namespace HeilpraktikerPraxis.Models;

public class Behandlung
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public Patient? Patient { get; set; }
    public int? TerminId { get; set; }
    public Termin? Termin { get; set; }
    public DateOnly Datum { get; set; } = DateOnly.FromDateTime(DateTime.Today);
    public string Therapeut { get; set; } = "";
    public string Diagnose { get; set; } = "";
    public string Therapie { get; set; } = "";
    public string Befund { get; set; } = "";
    public string Verlauf { get; set; } = "";
    public string? NaechsteSchritte { get; set; }
    public string? Medikamente { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.Now;
    public DateTime Geaendert { get; set; } = DateTime.Now;
}
