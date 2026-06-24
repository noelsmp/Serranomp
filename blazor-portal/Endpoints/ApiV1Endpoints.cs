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

        // POST /api/v1/patienten/{id}/dokumente  (multipart upload from PraxisVerwaltung)
        group.MapPost("/patienten/{id}/dokumente", async (
            string id, AppDbContext db, HttpContext httpContext,
            IServiceProvider sp) =>
        {
            var patient = await db.Benutzer.FirstOrDefaultAsync(b => b.Id == id && b.Rolle == "patient");
            if (patient == null) return Results.NotFound();

            if (!httpContext.Request.HasFormContentType)
                return Results.BadRequest("Multipart-Formular erwartet.");

            var form = await httpContext.Request.ReadFormAsync();
            var file = form.Files["datei"];
            if (file == null) return Results.BadRequest("Kein Datei-Feld 'datei'.");

            var kategorie = form["kategorie"].FirstOrDefault() ?? "sonstiges";
            var name = form["name"].FirstOrDefault() ?? file.FileName;
            var hochgeladenVonName = form["vonName"].FirstOrDefault() ?? "Praxis";

            var storageSvc = sp.GetRequiredService<PatientenPortal.Services.StorageService>();
            string relativePath;
            using (var stream = file.OpenReadStream())
                relativePath = await storageSvc.SaveAsync(stream, file.FileName);

            var doc = new Dokument
            {
                Id = NewId(),
                PatientId = id,
                Name = name,
                Kategorie = kategorie,
                Dateipfad = relativePath,
                Dateigroesse = file.Length,
                MimeType = file.ContentType,
                HochgeladenVon = "praxis",
                HochgeladenVonName = hochgeladenVonName,
                Erstellt = DateTime.UtcNow
            };
            db.Dokumente.Add(doc);
            await db.SaveChangesAsync();

            return Results.Created($"/api/v1/dokumente/{doc.Id}", new
            {
                doc.Id, doc.PatientId, doc.Name, doc.Kategorie,
                doc.Dateigroesse, doc.MimeType, doc.Erstellt
            });
        });

        // DELETE /api/v1/dokumente/{id}
        group.MapDelete("/dokumente/{id}", async (string id, AppDbContext db, IServiceProvider sp) =>
        {
            var doc = await db.Dokumente.FindAsync(id);
            if (doc == null) return Results.NotFound();

            var storageSvc = sp.GetRequiredService<PatientenPortal.Services.StorageService>();
            storageSvc.Delete(doc.Dateipfad);
            db.Dokumente.Remove(doc);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // GET /api/v1/registrierungen  (pending registrations for PraxisVerwaltung)
        group.MapGet("/registrierungen", async (AppDbContext db, string? status = "ausstehend") =>
        {
            var query = db.Registrierungen.AsQueryable();
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(r => r.Status == status);

            var list = await query.OrderBy(r => r.Erstellt).ToListAsync();
            return Results.Ok(list.Select(r => new
            {
                r.Id, r.Vorname, r.Nachname, r.Email, r.Geburtsdatum,
                r.Telefon, r.Status, r.Erstellt
            }));
        });

        // POST /api/v1/registrierungen/{id}/freischalten
        group.MapPost("/registrierungen/{id}/freischalten", async (
            string id, AppDbContext db, IServiceProvider sp) =>
        {
            var reg = await db.Registrierungen.FindAsync(id);
            if (reg == null) return Results.NotFound();
            if (reg.Status != "ausstehend") return Results.BadRequest("Registrierung ist nicht ausstehend.");

            if (await db.Benutzer.AnyAsync(b => b.Email == reg.Email))
                return Results.Conflict("Benutzer mit dieser E-Mail existiert bereits.");

            var rng = new Random();
            const string up = "ABCDEFGHJKLMNPQRSTUVWXYZ", lo = "abcdefghjkmnpqrstuvwxyz", di = "23456789";
            var chars = new char[10];
            chars[0] = up[rng.Next(up.Length)]; chars[1] = di[rng.Next(di.Length)];
            for (int i = 2; i < 10; i++) chars[i] = (up + lo + di)[rng.Next((up + lo + di).Length)];
            var tempPw = new string(chars.OrderBy(_ => rng.Next()).ToArray());

            var user = new Benutzer
            {
                Id = NewId(), Email = reg.Email,
                PasswortHash = BCrypt.Net.BCrypt.HashPassword(tempPw, 12),
                Vorname = reg.Vorname, Nachname = reg.Nachname,
                Geburtsdatum = reg.Geburtsdatum, Telefon = reg.Telefon,
                Rolle = "patient", Status = "aktiv", Erstellt = DateTime.UtcNow
            };
            db.Benutzer.Add(user);
            reg.Status = "freigeschaltet";
            reg.BearbeitetAm = DateTime.UtcNow;
            await db.SaveChangesAsync();

            var config = sp.GetRequiredService<IConfiguration>();
            var emailSvc = sp.GetRequiredService<PatientenPortal.Services.EmailService>();
            var appUrl = config["AppUrl"] ?? "https://portal.seo-smp.de";
            await emailSvc.SendFreischaltungBestaetigung(reg.Email, reg.Vorname, $"{appUrl}/login", tempPw);

            return Results.Ok(new { user.Id, user.Email, user.Vorname, user.Nachname, TempPasswort = tempPw });
        });

        // POST /api/v1/registrierungen/{id}/ablehnen
        group.MapPost("/registrierungen/{id}/ablehnen", async (
            string id, AppDbContext db, IServiceProvider sp) =>
        {
            var reg = await db.Registrierungen.FindAsync(id);
            if (reg == null) return Results.NotFound();
            if (reg.Status != "ausstehend") return Results.BadRequest("Registrierung ist nicht ausstehend.");

            reg.Status = "abgelehnt";
            reg.BearbeitetAm = DateTime.UtcNow;
            await db.SaveChangesAsync();

            var config = sp.GetRequiredService<IConfiguration>();
            var emailSvc = sp.GetRequiredService<PatientenPortal.Services.EmailService>();
            var praxisEmail = config["EmailPraxis"] ?? "info@naturheilpraxis-hilfreich.de";
            var praxisTel = config["PraxisTelefon"] ?? "";
            await emailSvc.SendAblehnung(reg.Email, reg.Vorname, reg.Nachname, praxisEmail, praxisTel);

            return Results.NoContent();
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
