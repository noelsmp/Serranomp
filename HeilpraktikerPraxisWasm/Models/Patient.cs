using System.Text.Json.Serialization;
namespace HeilpraktikerPraxisWasm.Models;
public class Patient
{
    public int Id { get; set; }
    public string PatientNr { get; set; } = "";
    public string Anrede { get; set; } = "Frau";
    public string Vorname { get; set; } = "";
    public string Nachname { get; set; } = "";
    public DateOnly? Geburtsdatum { get; set; }
    public string Strasse { get; set; } = "";
    public string Plz { get; set; } = "";
    public string Ort { get; set; } = "";
    public string Telefon { get; set; } = "";
    public string Email { get; set; } = "";
    public string Versicherungsart { get; set; } = "Gesetzlich";
    public string? Krankenkasse { get; set; }
    public string? Versicherungsnr { get; set; }
    public string? Beruf { get; set; }
    public string? Notfallkontakt { get; set; }
    public string? Notfalltelefon { get; set; }
    public string? Anamnese { get; set; }
    public string? Allergien { get; set; }
    public string? Dauermedikamente { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.Now;
    public bool Aktiv { get; set; } = true;
    public string VollerName => $"{Anrede} {Vorname} {Nachname}".Trim();
    public int? Alter => Geburtsdatum.HasValue ? (int)((DateTime.Today - Geburtsdatum.Value.ToDateTime(TimeOnly.MinValue)).TotalDays / 365.25) : null;
}
