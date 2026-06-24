using Microsoft.EntityFrameworkCore;
using PatientenPortal.Data;
using PatientenPortal.Data.Models;

namespace PatientenPortal.Endpoints;

public static class ApiV1Endpoints
{
    private static string NewId() => Guid.NewGuid().ToString("N")[..21];

    public static void MapApiV1Endpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1")
            .AddEndpointFilter(async (ctx, next) =>
            {
                var config = ctx.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
                var apiKey = config["PortalApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                    return Results.Problem("API key not configured.", statusCode: 503);

                var authHeader = ctx.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
                if (authHeader == null || !authHeader.StartsWith("Bearer "))
                    return Results.Unauthorized();

                var providedKey = authHeader["Bearer ".Length..].Trim();
                if (providedKey != apiKey)
                    return Results.Unauthorized();

                return await next(ctx);
            });

        // GET /api/v1/patienten
        group.MapGet("/patienten", async (AppDbContext db, string? search = null) =>
        {
            var query = db.Benutzer.Where(b => b.Rolle == "patient").AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(b =>
                    b.Email.ToLower().Contains(s) ||
                    b.Vorname.ToLower().Contains(s) ||
                    b.Nachname.ToLower().Contains(s) ||
                    (b.PraxisPatientNr != null && b.PraxisPatientNr.ToLower().Contains(s)));
            }
            var patients = await query.OrderBy(b => b.Nachname).ThenBy(b => b.Vorname).ToListAsync();
            return Results.Ok(patients.Select(p => new
            {
                p.Id, p.Email, p.Vorname, p.Nachname, p.Geburtsdatum,
                p.Telefon, p.Rolle, p.Status, p.PraxisPatientNr, p.Erstellt, p.LetzterLogin
            }));
        });

        // GET /api/v1/patienten/{id}
        group.MapGet("/patienten/{id}", async (string id, AppDbContext db) =>
        {
            var patient = await db.Benutzer
                .Include(b => b.Dokumente)
                .FirstOrDefaultAsync(b => b.Id == id && b.Rolle == "patient");

            if (patient == null) return Results.NotFound();

            return Results.Ok(new
            {
                patient.Id, patient.Email, patient.Vorname, patient.Nachname,
                patient.Geburtsdatum, patient.Telefon, patient.Rolle, patient.Status,
                patient.PraxisPatientNr, patient.Erstellt, patient.LetzterLogin,
                Dokumente = patient.Dokumente.Select(d => new
                {
                    d.Id, d.Name, d.Kategorie, d.Dateigroesse, d.MimeType,
                    d.HochgeladenVon, d.HochgeladenVonName, d.Erstellt
                })
            });
        });

        // PATCH /api/v1/patienten/{id}
        group.MapMethods("/patienten/{id}", new[] { "PATCH" }, async (
            string id, AppDbContext db, HttpContext httpContext) =>
        {
            var patient = await db.Benutzer.FirstOrDefaultAsync(b => b.Id == id && b.Rolle == "patient");
            if (patient == null) return Results.NotFound();

            var body = await httpContext.Request.ReadFromJsonAsync<Dictionary<string, object?>>();
            if (body == null) return Results.BadRequest("Kein Body.");

            if (body.TryGetValue("vorname", out var vorname) && vorname != null)
                patient.Vorname = vorname.ToString()!;
            if (body.TryGetValue("nachname", out var nachname) && nachname != null)
                patient.Nachname = nachname.ToString()!;
            if (body.TryGetValue("telefon", out var telefon))
                patient.Telefon = telefon?.ToString();
            if (body.TryGetValue("praxisPatientNr", out var nr))
                patient.PraxisPatientNr = nr?.ToString();
            if (body.TryGetValue("status", out var status) && status != null)
                patient.Status = status.ToString()!;

            await db.SaveChangesAsync();
            return Results.Ok(new { patient.Id, patient.Email, patient.Vorname, patient.Nachname,
                patient.Status, patient.PraxisPatientNr });
        });

        // GET /api/v1/patienten/{id}/dokumente
        group.MapGet("/patienten/{id}/dokumente", async (string id, AppDbContext db) =>
        {
            var patient = await db.Benutzer.FindAsync(id);
            if (patient == null) return Results.NotFound();

            var docs = await db.Dokumente
                .Where(d => d.PatientId == id)
                .OrderByDescending(d => d.Erstellt)
                .ToListAsync();

            return Results.Ok(docs.Select(d => new
            {
                d.Id, d.Name, d.Kategorie, d.Dateigroesse, d.MimeType,
                d.HochgeladenVon, d.HochgeladenVonName, d.Erstellt
            }));
        });

        // POST /api/v1/patienten/{id}/rechnungen
        group.MapPost("/patienten/{id}/rechnungen", async (
            string id, AppDbContext db, HttpContext httpContext) =>
        {
            var patient = await db.Benutzer.FirstOrDefaultAsync(b => b.Id == id && b.Rolle == "patient");
            if (patient == null) return Results.NotFound();

            var body = await httpContext.Request.ReadFromJsonAsync<RechnungCreateDto>();
            if (body == null) return Results.BadRequest("Kein Body.");

            var rechnung = new Rechnung
            {
                Id = NewId(),
                PatientId = id,
                Rechnungsnr = body.Rechnungsnr ?? $"RE-{DateTime.UtcNow:yyyyMMdd}-{NewId()[..6].ToUpper()}",
                Ausstellungsdatum = body.Ausstellungsdatum ?? DateTime.UtcNow,
                Faelligkeitsdatum = body.Faelligkeitsdatum ?? DateTime.UtcNow.AddDays(30),
                Gesamtbetrag = body.Gesamtbetrag,
                Bezahlt = body.Bezahlt,
                BezahltAm = body.Bezahlt ? DateTime.UtcNow : null,
                DokumentId = body.DokumentId,
                Erstellt = DateTime.UtcNow
            };

            db.Rechnungen.Add(rechnung);
            await db.SaveChangesAsync();

            return Results.Created($"/api/v1/rechnungen/{rechnung.Id}", new
            {
                rechnung.Id, rechnung.PatientId, rechnung.Rechnungsnr,
                rechnung.Ausstellungsdatum, rechnung.Faelligkeitsdatum,
                rechnung.Gesamtbetrag, rechnung.Bezahlt, rechnung.BezahltAm, rechnung.Erstellt
            });
        });

        // GET /api/v1/patienten/{id}/rechnungen
        group.MapGet("/patienten/{id}/rechnungen", async (string id, AppDbContext db) =>
        {
            var patient = await db.Benutzer.FindAsync(id);
            if (patient == null) return Results.NotFound();

            var rechnungen = await db.Rechnungen
                .Where(r => r.PatientId == id)
                .OrderByDescending(r => r.Ausstellungsdatum)
                .ToListAsync();

            return Results.Ok(rechnungen.Select(r => new
            {
                r.Id, r.PatientId, r.Rechnungsnr, r.Ausstellungsdatum,
                r.Faelligkeitsdatum, r.Gesamtbetrag, r.Bezahlt, r.BezahltAm,
                r.DokumentId, r.Erstellt
            }));
        });

        // PATCH /api/v1/rechnungen/{id}
        group.MapMethods("/rechnungen/{id}", new[] { "PATCH" }, async (
            string id, AppDbContext db, HttpContext httpContext) =>
        {
            var rechnung = await db.Rechnungen.FindAsync(id);
            if (rechnung == null) return Results.NotFound();

            var body = await httpContext.Request.ReadFromJsonAsync<Dictionary<string, object?>>();
            if (body == null) return Results.BadRequest("Kein Body.");

            if (body.TryGetValue("bezahlt", out var bezahlt) && bezahlt != null)
            {
                rechnung.Bezahlt = bool.Parse(bezahlt.ToString()!);
                rechnung.BezahltAm = rechnung.Bezahlt ? DateTime.UtcNow : null;
            }
            if (body.TryGetValue("rechnungsnr", out var nr) && nr != null)
                rechnung.Rechnungsnr = nr.ToString()!;
            if (body.TryGetValue("faelligkeitsdatum", out var fd) && fd != null)
                rechnung.Faelligkeitsdatum = DateTime.Parse(fd.ToString()!);
            if (body.TryGetValue("dokumentId", out var docId))
                rechnung.DokumentId = docId?.ToString();

            await db.SaveChangesAsync();
            return Results.Ok(new
            {
                rechnung.Id, rechnung.Rechnungsnr, rechnung.Gesamtbetrag,
                rechnung.Bezahlt, rechnung.BezahltAm, rechnung.Faelligkeitsdatum
            });
        });
    }

    private record RechnungCreateDto(
        string? Rechnungsnr,
        DateTime? Ausstellungsdatum,
        DateTime? Faelligkeitsdatum,
        decimal Gesamtbetrag,
        bool Bezahlt = false,
        string? DokumentId = null);
}
