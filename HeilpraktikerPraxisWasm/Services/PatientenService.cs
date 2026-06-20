using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;
namespace HeilpraktikerPraxisWasm.Services;
public class PatientenService(ILocalStorageService storage)
{
    private const string Key = "patienten";
    public async Task<List<Patient>> AllePatientenAsync(bool nurAktive = false)
    {
        var list = await storage.GetItemAsync<List<Patient>>(Key) ?? [];
        return nurAktive ? list.Where(p => p.Aktiv).OrderBy(p => p.Nachname).ToList()
                         : list.OrderBy(p => p.Nachname).ToList();
    }
    public async Task<Patient?> GetPatientAsync(int id) =>
        (await AllePatientenAsync()).FirstOrDefault(p => p.Id == id);
    public async Task<Patient> SpeichernAsync(Patient patient)
    {
        var list = await AllePatientenAsync();
        if (patient.Id == 0)
        {
            patient.Id = IdHelper.NextId(list, p => p.Id);
            patient.PatientNr = $"P-{DateTime.Now.Year}-{patient.Id:D3}";
            patient.Erstellt = DateTime.Now;
            list.Add(patient);
        }
        else { var i = list.FindIndex(p => p.Id == patient.Id); if (i >= 0) list[i] = patient; }
        await storage.SetItemAsync(Key, list);
        return patient;
    }
    public async Task LoeschenAsync(int id)
    {
        var list = await AllePatientenAsync();
        var p = list.FirstOrDefault(x => x.Id == id);
        if (p != null) { p.Aktiv = false; await storage.SetItemAsync(Key, list); }
    }
    public async Task<int> AnzahlAktivAsync() => (await AllePatientenAsync(true)).Count;
}
