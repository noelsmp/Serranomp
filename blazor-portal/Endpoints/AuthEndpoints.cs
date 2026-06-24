using Microsoft.EntityFrameworkCore;
using PatientenPortal.Data;
using PatientenPortal.Data.Models;
using PatientenPortal.Services;

namespace PatientenPortal.Endpoints;

public static class AuthEndpoints
{
    private static string NewId() => Guid.NewGuid().ToString("N")[..21];

    private static string GenerateTempPassword()
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghjkmnpqrstuvwxyz";
        const string digits = "23456789";
        const string all = upper + lower + digits;
        var rng = new Random();
        var chars = new char[10];
        chars[0] = upper[rng.Next(upper.Length)];
        chars[1] = digits[rng.Next(digits.Length)];
        for (int i = 2; i < 10; i++)
            chars[i] = all[rng.Next(all.Length)];
        return new string(chars.OrderBy(_ => rng.Next()).ToArray());
    }

    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/freischaltung", async (
            string token,
            string aktion,
            AppDbContext db,
            EmailService emailService,
            AuditService auditService,
            IConfiguration config,
            HttpContext httpContext) =>
        {
            var registrierung = await db.Registrierungen
                .FirstOrDefaultAsync(r => r.Token == token && r.Status == "ausstehend");

            if (registrierung == null)
                return Results.BadRequest("Ungültiger oder bereits verwendeter Token.");

            var ip = httpContext.Request.Headers["x-forwarded-for"].FirstOrDefault()
                     ?? httpContext.Connection.RemoteIpAddress?.ToString();

            if (aktion == "ablehnen")
            {
                registrierung.Status = "abgelehnt";
                registrierung.BearbeitetAm = DateTime.UtcNow;
                await db.SaveChangesAsync();

                await auditService.LogAsync(db, null, "registrierung_abgelehnt",
                    $"Registrierung {registrierung.Id} für {registrierung.Email} abgelehnt", ip);

                var praxisEmail = config["EmailPraxis"] ?? "info@naturheilpraxis-hilfreich.de";
                var praxisTel = config["PraxisTelefon"] ?? "";
                await emailService.SendAblehnung(registrierung.Email,
                    registrierung.Vorname, registrierung.Nachname, praxisEmail, praxisTel);

                return Results.Ok(new { message = "Registrierung abgelehnt und Patient benachrichtigt." });
            }
            else if (aktion == "freischalten")
            {
                var existingUser = await db.Benutzer
                    .FirstOrDefaultAsync(b => b.Email == registrierung.Email);

                if (existingUser != null)
                    return Results.BadRequest("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.");

                var tempPassword = GenerateTempPassword();
                var newUser = new Benutzer
                {
                    Id = NewId(),
                    Email = registrierung.Email,
                    PasswortHash = BCrypt.Net.BCrypt.HashPassword(tempPassword, 12),
                    Vorname = registrierung.Vorname,
                    Nachname = registrierung.Nachname,
                    Geburtsdatum = registrierung.Geburtsdatum,
                    Telefon = registrierung.Telefon,
                    Rolle = "patient",
                    Status = "aktiv",
                    Erstellt = DateTime.UtcNow
                };
                db.Benutzer.Add(newUser);

                registrierung.Status = "freigeschaltet";
                registrierung.BearbeitetAm = DateTime.UtcNow;
                await db.SaveChangesAsync();

                await auditService.LogAsync(db, newUser.Id, "benutzer_erstellt",
                    $"Patient {newUser.Email} nach Registrierung freigeschaltet", ip);

                var appUrl = config["AppUrl"] ?? "https://portal.seo-smp.de";
                await emailService.SendFreischaltungBestaetigung(
                    newUser.Email, newUser.Vorname, $"{appUrl}/login", tempPassword);

                return Results.Ok(new { message = "Patient erfolgreich freigeschaltet und per E-Mail benachrichtigt." });
            }
            else
            {
                return Results.BadRequest("Ungültige Aktion. Erlaubt: freischalten, ablehnen");
            }
        });
    }
}
