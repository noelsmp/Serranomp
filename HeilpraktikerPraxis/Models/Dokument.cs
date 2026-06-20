namespace HeilpraktikerPraxis.Models;

public class Dokument
{
    public int Id { get; set; }
    public int? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string Name { get; set; } = "";
    public string Typ { get; set; } = "";
    public DokumentKategorie Kategorie { get; set; } = DokumentKategorie.Sonstiges;
    public string? Beschreibung { get; set; }
    public byte[] Daten { get; set; } = [];
    public long Groesse { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.Now;

    public string GroesseFormatiert => Groesse switch
    {
        < 1024 => $"{Groesse} B",
        < 1024 * 1024 => $"{Groesse / 1024.0:F1} KB",
        _ => $"{Groesse / (1024.0 * 1024.0):F1} MB"
    };
}

public enum DokumentKategorie
{
    Befund,
    Rezept,
    Brief,
    Einwilligung,
    Sonstiges
}
