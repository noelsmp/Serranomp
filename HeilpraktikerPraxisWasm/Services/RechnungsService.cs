using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;
namespace HeilpraktikerPraxisWasm.Services;
public class RechnungsService(ILocalStorageService storage, PatientenService patientenSvc)
{
    private const string Key = "rechnungen";
    private async Task<List<Rechnung>> LoadRawAsync() =>
        await storage.GetItemAsync<List<Rechnung>>(Key) ?? [];
    private async Task AttachPatienten(List<Rechnung> rechnungen)
    {
        var patienten = await patientenSvc.AllePatientenAsync();
        foreach (var r in rechnungen) r.Patient = patienten.FirstOrDefault(p => p.Id == r.PatientId);
    }
    public async Task<List<Rechnung>> AlleRechnungenAsync(string? suche = null)
    {
        var list = await LoadRawAsync();
        await AttachPatienten(list);
        if (!string.IsNullOrWhiteSpace(suche))
            list = list.Where(r => r.Rechnungsnr.Contains(suche, StringComparison.OrdinalIgnoreCase) ||
                (r.Patient?.VollerName.Contains(suche, StringComparison.OrdinalIgnoreCase) ?? false)).ToList();
        return list.OrderByDescending(r => r.Ausstellungsdatum).ToList();
    }
    public async Task<Rechnung?> GetRechnungAsync(int id)
    {
        var list = await LoadRawAsync();
        var r = list.FirstOrDefault(x => x.Id == id);
        if (r != null) r.Patient = await patientenSvc.GetPatientAsync(r.PatientId);
        return r;
    }
    public async Task<List<Rechnung>> RechnungenFuerPatientAsync(int patientId) =>
        (await LoadRawAsync()).Where(r => r.PatientId == patientId).OrderByDescending(r => r.Ausstellungsdatum).ToList();
    public async Task<Rechnung> SpeichernAsync(Rechnung rechnung)
    {
        var list = await LoadRawAsync();
        rechnung.Zwischensumme = rechnung.Positionen.Sum(p => p.Einzelpreis * p.Anzahl);
        rechnung.MwstBetrag = Math.Round(rechnung.Zwischensumme * rechnung.MwstSatz / 100, 2);
        rechnung.Gesamtbetrag = rechnung.Zwischensumme + rechnung.MwstBetrag;
        rechnung.Patient = null;
        if (rechnung.Id == 0)
        {
            rechnung.Id = IdHelper.NextId(list, r => r.Id);
            rechnung.Rechnungsnr = GenerateNr(list);
            rechnung.Erstellt = DateTime.Now;
            list.Add(rechnung);
        }
        else { var i = list.FindIndex(r => r.Id == rechnung.Id); if (i >= 0) list[i] = rechnung; }
        await storage.SetItemAsync(Key, list);
        return rechnung;
    }
    public async Task AlsBeahltMarkierenAsync(int id, string zahlungsart)
    {
        var list = await LoadRawAsync();
        var r = list.FirstOrDefault(x => x.Id == id);
        if (r != null) { r.Bezahlt = true; r.BezahltAm = DateTime.Now; r.Zahlungsart = zahlungsart; await storage.SetItemAsync(Key, list); }
    }
    public async Task LoeschenAsync(int id)
    {
        var list = await LoadRawAsync();
        list.RemoveAll(r => r.Id == id);
        await storage.SetItemAsync(Key, list);
    }
    public async Task<decimal> OffenerBetragAsync() =>
        (await LoadRawAsync()).Where(r => !r.Bezahlt).Sum(r => r.Gesamtbetrag);
    public async Task<decimal> UmsatzMonatAsync() =>
        (await LoadRawAsync()).Where(r => r.Bezahlt && r.BezahltAm.HasValue && r.BezahltAm.Value.Month == DateTime.Today.Month && r.BezahltAm.Value.Year == DateTime.Today.Year).Sum(r => r.Gesamtbetrag);
    private static string GenerateNr(List<Rechnung> list)
    {
        var prefix = $"RE-{DateTime.Now.Year}{DateTime.Now.Month:D2}";
        var count = list.Count(r => r.Rechnungsnr.StartsWith(prefix)) + 1;
        return $"{prefix}-{count:D3}";
    }
}
