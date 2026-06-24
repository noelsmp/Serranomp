using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;
namespace HeilpraktikerPraxisWasm.Services;
public class DokumentService(ILocalStorageService storage, PatientenService patientenSvc)
{
    private const string Key = "dokumente";
    private async Task<List<Dokument>> LoadRawAsync() =>
        await storage.GetItemAsync<List<Dokument>>(Key) ?? [];
    public async Task<List<Dokument>> AlleDokumenteAsync(int? patientId = null)
    {
        var list = await LoadRawAsync();
        if (patientId.HasValue) list = list.Where(d => d.PatientId == patientId.Value).ToList();
        var patienten = await patientenSvc.AllePatientenAsync();
        // Don't return binary data in listing - set empty
        return list.Select(d => new Dokument {
            Id = d.Id, PatientId = d.PatientId, Name = d.Name, Typ = d.Typ,
            Kategorie = d.Kategorie, Beschreibung = d.Beschreibung, Groesse = d.Groesse,
            Erstellt = d.Erstellt, DatenBase64 = "",
            Patient = patienten.FirstOrDefault(p => p.Id == d.PatientId)
        }).OrderByDescending(d => d.Erstellt).ToList();
    }
    public async Task<Dokument?> GetDokumentAsync(int id) =>
        (await LoadRawAsync()).FirstOrDefault(d => d.Id == id);
    public async Task<Dokument> SpeichernAsync(Dokument dokument)
    {
        var list = await LoadRawAsync();
        dokument.Patient = null;
        if (dokument.Id == 0) { dokument.Id = IdHelper.NextId(list, d => d.Id); dokument.Erstellt = DateTime.Now; list.Add(dokument); }
        else { var i = list.FindIndex(d => d.Id == dokument.Id); if (i >= 0) list[i] = dokument; }
        await storage.SetItemAsync(Key, list);
        return dokument;
    }
    public async Task LoeschenAsync(int id)
    {
        var list = await LoadRawAsync();
        list.RemoveAll(d => d.Id == id);
        await storage.SetItemAsync(Key, list);
    }
}
