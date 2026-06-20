using HeilpraktikerPraxisWasm.Models;
using Microsoft.JSInterop;

namespace HeilpraktikerPraxisWasm.Services;

public class EmailService(IJSRuntime js, PraxisService praxisSvc)
{
    public async Task TerminBestaetigenAsync(Termin termin, string empfaenger)
    {
        var praxis = await praxisSvc.GetPraxisDatenAsync();

        if (string.IsNullOrWhiteSpace(praxis.EmailJsServiceId) ||
            string.IsNullOrWhiteSpace(praxis.EmailJsTemplateId) ||
            string.IsNullOrWhiteSpace(praxis.EmailJsPublicKey))
            throw new InvalidOperationException("EmailJS nicht konfiguriert. Bitte unter Einstellungen eintragen.");

        var deDE = new System.Globalization.CultureInfo("de-DE");
        var params_ = new Dictionary<string, string>
        {
            ["to_email"]      = empfaenger,
            ["patient_name"]  = termin.Patient?.VollerName ?? empfaenger,
            ["termin_datum"]  = termin.Datum.ToString("dddd, dd. MMMM yyyy", deDE),
            ["termin_uhrzeit"]= termin.Datum.ToString("HH:mm") + " Uhr",
            ["termin_art"]    = termin.Art,
            ["termin_dauer"]  = $"{termin.DauerMinuten} Minuten",
            ["praxis_name"]   = praxis.Name,
            ["praxis_adresse"]= $"{praxis.Strasse}, {praxis.Plz} {praxis.Ort}",
            ["praxis_telefon"]= praxis.Telefon,
        };

        await js.InvokeVoidAsync("praxisEmail.send",
            praxis.EmailJsServiceId, praxis.EmailJsTemplateId, praxis.EmailJsPublicKey, params_);
    }

    public async Task SmsOeffnenAsync(string telefon, Termin termin)
    {
        var praxis = await praxisSvc.GetPraxisDatenAsync();
        var deDE = new System.Globalization.CultureInfo("de-DE");
        var text = $"Ihr Termin: {termin.Datum.ToString("dd.MM.yyyy", deDE)} um {termin.Datum:HH:mm} Uhr ({termin.Art}) – {praxis.Name}, {praxis.Telefon}";
        await js.InvokeVoidAsync("praxisEmail.openSms", telefon, text);
    }
}
