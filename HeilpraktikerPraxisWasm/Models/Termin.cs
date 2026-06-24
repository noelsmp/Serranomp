using System.Text.Json.Serialization;
namespace HeilpraktikerPraxisWasm.Models;
public class Termin
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    [JsonIgnore] public Patient? Patient { get; set; }
    public DateTime Datum { get; set; }
    public int DauerMinuten { get; set; } = 60;
    public string Art { get; set; } = "";
    public string? Notizen { get; set; }
    public TerminStatus Status { get; set; } = TerminStatus.Geplant;
    public DateTime Erstellt { get; set; } = DateTime.Now;
    [JsonIgnore] public DateTime Ende => Datum.AddMinutes(DauerMinuten);
}
public enum TerminStatus { Geplant, Erschienen, Abgesagt, NichtErschienen }
