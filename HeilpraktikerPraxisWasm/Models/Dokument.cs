using System.Text.Json.Serialization;
namespace HeilpraktikerPraxisWasm.Models;
public class Dokument
{
    public int Id { get; set; }
    public int? PatientId { get; set; }
    [JsonIgnore] public Patient? Patient { get; set; }
    public string Name { get; set; } = "";
    public string Typ { get; set; } = "";
    public DokumentKategorie Kategorie { get; set; }
    public string? Beschreibung { get; set; }
    public long Groesse { get; set; }
    public string DatenBase64 { get; set; } = ""; // stored as base64 instead of byte[]
    public DateTime Erstellt { get; set; } = DateTime.Now;
    [JsonIgnore] public string GroesseFormatiert => Groesse < 1024 ? $"{Groesse} B" : Groesse < 1048576 ? $"{Groesse / 1024} KB" : $"{Groesse / 1048576:F1} MB";
}
public enum DokumentKategorie { Befund, Rezept, Brief, Einwilligung, Sonstiges }
