using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm;
using HeilpraktikerPraxisWasm.Components;
using HeilpraktikerPraxisWasm.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MudBlazor.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddMudServices();
builder.Services.AddBlazoredLocalStorage();

builder.Services.AddScoped<PraxisService>();
builder.Services.AddScoped<PinService>();
builder.Services.AddScoped<PatientenService>();
builder.Services.AddScoped<TerminService>();
builder.Services.AddScoped<RechnungsService>();
builder.Services.AddScoped<BehandlungsService>();
builder.Services.AddScoped<DokumentService>();
builder.Services.AddScoped<GebueHService>();
builder.Services.AddScoped<ZugferdService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<TestdatenSeeder>();

await builder.Build().RunAsync();
