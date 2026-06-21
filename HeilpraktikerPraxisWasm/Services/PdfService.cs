using HeilpraktikerPraxisWasm.Models;
using Microsoft.JSInterop;
namespace HeilpraktikerPraxisWasm.Services;
public class PdfService(IJSRuntime js)
{
    public async Task DownloadRechnungAsync(Rechnung rechnung, PraxisDaten praxis) =>
        await js.InvokeVoidAsync("praxisPdf.downloadRechnung", rechnung, praxis);
    public async Task DownloadZugferdAsync(Rechnung rechnung, PraxisDaten praxis, string zugferdXml) =>
        await js.InvokeVoidAsync("praxisPdf.downloadZugferd", rechnung, praxis, zugferdXml);

    public async Task ShareZugferdAsync(Rechnung rechnung, PraxisDaten praxis, string zugferdXml, string? passwort = null) =>
        await js.InvokeVoidAsync("praxisPdf.shareZugferd", rechnung, praxis, zugferdXml, passwort);
}
