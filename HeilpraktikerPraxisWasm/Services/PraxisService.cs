using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;
namespace HeilpraktikerPraxisWasm.Services;
public class PraxisService(ILocalStorageService storage)
{
    private const string Key = "praxisdaten";
    public async Task<PraxisDaten> GetPraxisDatenAsync() =>
        await storage.GetItemAsync<PraxisDaten>(Key) ?? new PraxisDaten();
    public async Task SpeichernAsync(PraxisDaten daten) =>
        await storage.SetItemAsync(Key, daten);
}
