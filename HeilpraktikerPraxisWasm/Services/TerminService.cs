using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;
namespace HeilpraktikerPraxisWasm.Services;
public class TerminService(ILocalStorageService storage, PatientenService patientenSvc)
{
    private const string Key = "termine";
    private async Task<List<Termin>> LoadRawAsync() =>
        await storage.GetItemAsync<List<Termin>>(Key) ?? [];
    private async Task AttachPatienten(List<Termin> termine)
    {
        var patienten = await patientenSvc.AllePatientenAsync();
        foreach (var t in termine) t.Patient = patienten.FirstOrDefault(p => p.Id == t.PatientId);
    }
    public async Task<List<Termin>> AlleTermineAsync(DateTime? von = null, DateTime? bis = null)
    {
        var list = await LoadRawAsync();
        await AttachPatienten(list);
        if (von.HasValue) list = list.Where(t => t.Datum >= von.Value).ToList();
        if (bis.HasValue) list = list.Where(t => t.Datum <= bis.Value).ToList();
        return list.OrderBy(t => t.Datum).ToList();
    }
    public async Task<List<Termin>> TermineFuerPatientAsync(int patientId)
    {
        var list = await LoadRawAsync();
        return list.Where(t => t.PatientId == patientId).OrderByDescending(t => t.Datum).ToList();
    }
    public async Task<Termin?> GetTerminAsync(int id)
    {
        var list = await LoadRawAsync();
        var t = list.FirstOrDefault(x => x.Id == id);
        if (t != null) t.Patient = await patientenSvc.GetPatientAsync(t.PatientId);
        return t;
    }
    public async Task<Termin> SpeichernAsync(Termin termin)
    {
        var list = await LoadRawAsync();
        termin.Patient = null;
        if (termin.Id == 0) { termin.Id = IdHelper.NextId(list, t => t.Id); termin.Erstellt = DateTime.Now; list.Add(termin); }
        else { var i = list.FindIndex(t => t.Id == termin.Id); if (i >= 0) list[i] = termin; }
        await storage.SetItemAsync(Key, list);
        return termin;
    }
    public async Task LoeschenAsync(int id)
    {
        var list = await LoadRawAsync();
        list.RemoveAll(t => t.Id == id);
        await storage.SetItemAsync(Key, list);
    }
    public async Task<int> HeuteAnzahlAsync()
    {
        var list = await LoadRawAsync();
        var heute = DateTime.Today;
        return list.Count(t => t.Datum.Date == heute && t.Status == TerminStatus.Geplant);
    }
    public async Task<List<Termin>> NaechsteTermineAsync(int anzahl = 5)
    {
        var list = await LoadRawAsync();
        var jetzt = DateTime.Now;
        var result = list.Where(t => t.Datum >= jetzt && t.Status == TerminStatus.Geplant)
                         .OrderBy(t => t.Datum)
                         .Take(anzahl)
                         .ToList();
        await AttachPatienten(result);
        return result;
    }
}
