using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;
namespace HeilpraktikerPraxisWasm.Services;
public class BehandlungsService(ILocalStorageService storage, PatientenService patientenSvc)
{
    private const string Key = "behandlungen";
    private async Task<List<Behandlung>> LoadRawAsync() =>
        await storage.GetItemAsync<List<Behandlung>>(Key) ?? [];
    public async Task<List<Behandlung>> AlleBehandlungenAsync(int? patientId = null)
    {
        var list = await LoadRawAsync();
        if (patientId.HasValue) list = list.Where(b => b.PatientId == patientId.Value).ToList();
        var patienten = await patientenSvc.AllePatientenAsync();
        foreach (var b in list) b.Patient = patienten.FirstOrDefault(p => p.Id == b.PatientId);
        return list.OrderByDescending(b => b.Datum).ToList();
    }
    public async Task<Behandlung?> GetBehandlungAsync(int id) =>
        (await LoadRawAsync()).FirstOrDefault(b => b.Id == id);
    public async Task<Behandlung> SpeichernAsync(Behandlung behandlung)
    {
        var list = await LoadRawAsync();
        behandlung.Patient = null;
        behandlung.Geaendert = DateTime.Now;
        if (behandlung.Id == 0) { behandlung.Id = IdHelper.NextId(list, b => b.Id); behandlung.Erstellt = DateTime.Now; list.Add(behandlung); }
        else { var i = list.FindIndex(b => b.Id == behandlung.Id); if (i >= 0) list[i] = behandlung; }
        await storage.SetItemAsync(Key, list);
        return behandlung;
    }
    public async Task LoeschenAsync(int id)
    {
        var list = await LoadRawAsync();
        list.RemoveAll(b => b.Id == id);
        await storage.SetItemAsync(Key, list);
    }
}
