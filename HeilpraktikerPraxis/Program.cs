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

// SQLite Datenbank im lokalen AppData-Verzeichnis
var dbDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "HeilpraktikerPraxis");
Directory.CreateDirectory(dbDir);
var dbPath = Path.Combine(dbDir, "praxis.db");
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

var app = builder.Build();

// Datenbank erstellen/migrieren
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PraxisDbContext>();
    db.Database.EnsureCreated();
}

if (!app.Environment.IsDevelopment())
    app.UseExceptionHandler("/Error", createScopeForErrors: true);

app.UseStaticFiles();
app.UseAntiforgery();
app.MapStaticAssets();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();

app.Run();
