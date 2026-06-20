using HeilpraktikerPraxis.Components;
using HeilpraktikerPraxis.Data;
using HeilpraktikerPraxis.Services;
using Microsoft.EntityFrameworkCore;
using MudBlazor.Services;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddMudServices();

// SQLite Datenbank: Umgebungsvariable DB_PATH (Container) oder lokales AppData
var dbPath = Environment.GetEnvironmentVariable("DB_PATH")
    ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "HeilpraktikerPraxis", "praxis.db");
Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);
builder.Services.AddDbContextFactory<PraxisDbContext>(opt => opt.UseSqlite($"Data Source={dbPath}"));

// Services
builder.Services.AddScoped<PatientenService>();
builder.Services.AddScoped<TerminService>();
builder.Services.AddScoped<RechnungsService>();
builder.Services.AddScoped<BehandlungsService>();
builder.Services.AddScoped<DokumentService>();
builder.Services.AddScoped<PraxisService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<ZugferdService>();
builder.Services.AddScoped<EmailService>();

var app = builder.Build();

// Datenbank erstellen + Testdaten einfügen
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PraxisDbContext>();
    db.Database.EnsureCreated();
    await HeilpraktikerPraxis.Data.TestdatenSeeder.SeedAsync(db);
}

if (!app.Environment.IsDevelopment())
    app.UseExceptionHandler("/Error", createScopeForErrors: true);

// HTTPS-Weiterleitung nur lokal (Render/Cloud macht SSL selbst via Reverse Proxy)
if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();
app.MapStaticAssets();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();

// PDF-Download-Endpunkte (direkte HTTP-URLs – funktioniert auf iOS Safari)
app.MapGet("/api/rechnung/{id}/pdf", async (
    int id, RechnungsService rechnungsSvc, PdfService pdfSvc, PraxisService praxisSvc) =>
{
    var r = await rechnungsSvc.GetRechnungAsync(id);
    if (r is null) return Results.NotFound();
    var praxis = await praxisSvc.GetPraxisDatenAsync();
    var pdf = pdfSvc.GenerateRechnung(r, praxis);
    return Results.File(pdf, "application/pdf", $"{r.Rechnungsnr}.pdf");
});

app.MapGet("/api/rechnung/{id}/zugferd", async (
    int id, RechnungsService rechnungsSvc, PdfService pdfSvc, ZugferdService zugferdSvc, PraxisService praxisSvc) =>
{
    var r = await rechnungsSvc.GetRechnungAsync(id);
    if (r is null) return Results.NotFound();
    var praxis = await praxisSvc.GetPraxisDatenAsync();
    var xml = zugferdSvc.GenerateXml(r, praxis);
    var pdf = pdfSvc.GenerateZugferdRechnung(r, praxis, xml);
    return Results.File(pdf, "application/pdf", $"{r.Rechnungsnr}_ZUGFeRD.pdf");
});

app.Run();
