using System.Text.Json.Serialization;
namespace HeilpraktikerPraxisWasm.Models;
public class Rechnung
{
    public int Id { get; set; }
    public string Rechnungsnr { get; set; } = "";
    public int PatientId { get; set; }
    [JsonIgnore] public Patient? Patient { get; set; }
    public DateOnly Ausstellungsdatum { get; set; } = DateOnly.FromDateTime(DateTime.Today);
    public DateOnly Faelligkeitsdatum { get; set; } = DateOnly.FromDateTime(DateTime.Today.AddDays(14));
    public List<RechnungsPosition> Positionen { get; set; } = [];
    public decimal Zwischensumme { get; set; }
    public decimal MwstSatz { get; set; } = 0;
    public decimal MwstBetrag { get; set; } = 0;
    public decimal Gesamtbetrag { get; set; }
    public bool Bezahlt { get; set; }
    public DateTime? BezahltAm { get; set; }
    public string? Zahlungsart { get; set; }
    public string? Notizen { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.Now;
}
public class RechnungsPosition
{
    public int Id { get; set; }
    public int RechnungId { get; set; }
    public string Ziffer { get; set; } = "";
    public string Leistung { get; set; } = "";
    public string Einheit { get; set; } = "";
    public int Anzahl { get; set; } = 1;
    public decimal Einzelpreis { get; set; }
    [JsonIgnore] public decimal Gesamtpreis => Anzahl * Einzelpreis;
}
