using PatientenPortal.Data.Models;

namespace PatientenPortal.Data;

public static class DbSeeder
{
    private static string NewId() => Guid.NewGuid().ToString("N")[..21];

    // Minimales aber gültiges PDF als Byte-Array
    private static byte[] TestPdf(string titel)
    {
        var inhalt = $"BT /F1 14 Tf 50 750 Td ({titel}) Tj ET";
        var pdf = $"%PDF-1.4\n" +
                  $"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
                  $"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
                  $"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n" +
                  $"4 0 obj<</Length {inhalt.Length}>>\nstream\n{inhalt}\nendstream\nendobj\n" +
                  $"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n" +
                  $"xref\n0 6\n0000000000 65535 f\r\n" +
                  $"trailer<</Size 6/Root 1 0 R>>\nstartxref\n500\n%%EOF";
        return System.Text.Encoding.Latin1.GetBytes(pdf);
    }

    private static async Task<string> SpeichereDatei(string uploadsPath, string subdir, string dateiname, string titel)
    {
        var dir = Path.Combine(uploadsPath, subdir);
        Directory.CreateDirectory(dir);
        var relativer = Path.Combine(subdir, dateiname);
        var vollPfad = Path.Combine(uploadsPath, relativer);
        if (!File.Exists(vollPfad))
            await File.WriteAllBytesAsync(vollPfad, TestPdf(titel));
        return relativer;
    }

    public static async Task SeedAsync(AppDbContext db, IConfiguration config, IWebHostEnvironment env)
    {
        var uploadsPath = config["UploadsPath"] ?? "/var/data/patientenportal/uploads";
        Directory.CreateDirectory(uploadsPath);

        // ── Admin ──────────────────────────────────────────────────────────────
        if (!db.Benutzer.Any(b => b.Rolle == "admin"))
        {
            var adminEmail = config["AdminEmail"] ?? "admin@example.de";
            var adminPw = config["AdminInitialPassword"] ?? "Admin2024!";
            db.Benutzer.Add(new Benutzer
            {
                Id = NewId(),
                Email = adminEmail,
                PasswortHash = BCrypt.Net.BCrypt.HashPassword(adminPw, 12),
                Vorname = "Admin",
                Nachname = "Hilfreich",
                Rolle = "admin",
                Status = "aktiv",
                Erstellt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
            Console.WriteLine($"✓ Admin: {adminEmail} / {adminPw}");
        }

        // Testdaten nur in Development
        if (!env.IsDevelopment()) return;

        // ── Testpatient 1: Maria Müller ────────────────────────────────────────
        if (!db.Benutzer.Any(b => b.Email == "maria.mueller@example.de"))
        {
            var p1Id = NewId();
            db.Benutzer.Add(new Benutzer
            {
                Id = p1Id,
                Email = "maria.mueller@example.de",
                PasswortHash = BCrypt.Net.BCrypt.HashPassword("Patient2024!", 12),
                Vorname = "Maria",
                Nachname = "Müller",
                Geburtsdatum = new DateTime(1975, 3, 15),
                Telefon = "02841 123456",
                Rolle = "patient",
                Status = "aktiv",
                PraxisPatientNr = "P-001",
                Erstellt = DateTime.UtcNow.AddDays(-120)
            });
            await db.SaveChangesAsync();

            // Dokumente
            var pfad1 = await SpeichereDatei(uploadsPath, p1Id, "anamnesebogen.pdf", "Anamnesebogen Erstbesuch");
            var dok1 = new Dokument
            {
                Id = NewId(), PatientId = p1Id,
                Name = "Anamnesebogen_Erstbesuch.pdf", Kategorie = "anamnesebogen",
                Dateipfad = pfad1, Dateigroesse = 1200, MimeType = "application/pdf",
                HochgeladenVon = "patient", HochgeladenVonName = "Maria Müller",
                Erstellt = DateTime.UtcNow.AddDays(-90)
            };

            var pfad2 = await SpeichereDatei(uploadsPath, p1Id, "befund-november.pdf", "Befundbericht November 2025");
            var dok2 = new Dokument
            {
                Id = NewId(), PatientId = p1Id,
                Name = "Befundbericht_November_2025.pdf", Kategorie = "behandlung",
                Dateipfad = pfad2, Dateigroesse = 2400, MimeType = "application/pdf",
                HochgeladenVon = "praxis", HochgeladenVonName = "Praxis",
                Erstellt = DateTime.UtcNow.AddDays(-60)
            };

            var pfad3 = await SpeichereDatei(uploadsPath, p1Id, "rechnung-2025-004.pdf", "Rechnung 2025-004");
            var dok3 = new Dokument
            {
                Id = NewId(), PatientId = p1Id,
                Name = "Rechnung_2025-004.pdf", Kategorie = "rechnung",
                Dateipfad = pfad3, Dateigroesse = 1500, MimeType = "application/pdf",
                HochgeladenVon = "praxis", HochgeladenVonName = "Praxis",
                Erstellt = DateTime.UtcNow.AddDays(-30)
            };

            db.Dokumente.AddRange(dok1, dok2, dok3);
            await db.SaveChangesAsync();

            db.Rechnungen.AddRange(
                new Rechnung
                {
                    Id = NewId(), PatientId = p1Id,
                    Rechnungsnr = "2025-001", Ausstellungsdatum = DateTime.UtcNow.AddDays(-120),
                    Faelligkeitsdatum = DateTime.UtcNow.AddDays(-99),
                    Gesamtbetrag = 89.50m, Bezahlt = true, BezahltAm = DateTime.UtcNow.AddDays(-100),
                    Erstellt = DateTime.UtcNow.AddDays(-120)
                },
                new Rechnung
                {
                    Id = NewId(), PatientId = p1Id,
                    Rechnungsnr = "2025-004", Ausstellungsdatum = DateTime.UtcNow.AddDays(-30),
                    Faelligkeitsdatum = DateTime.UtcNow.AddDays(-9),
                    Gesamtbetrag = 124.00m, Bezahlt = false, DokumentId = dok3.Id,
                    Erstellt = DateTime.UtcNow.AddDays(-30)
                }
            );
            await db.SaveChangesAsync();
            Console.WriteLine("✓ Patient 1: maria.mueller@example.de / Patient2024!");
        }

        // ── Testpatient 2: Thomas Schneider ───────────────────────────────────
        if (!db.Benutzer.Any(b => b.Email == "thomas.schneider@example.de"))
        {
            var p2Id = NewId();
            db.Benutzer.Add(new Benutzer
            {
                Id = p2Id,
                Email = "thomas.schneider@example.de",
                PasswortHash = BCrypt.Net.BCrypt.HashPassword("Patient2024!", 12),
                Vorname = "Thomas",
                Nachname = "Schneider",
                Geburtsdatum = new DateTime(1982, 7, 22),
                Telefon = "02841 654321",
                Rolle = "patient",
                Status = "aktiv",
                PraxisPatientNr = "P-002",
                Erstellt = DateTime.UtcNow.AddDays(-60)
            });
            await db.SaveChangesAsync();

            var pfad4 = await SpeichereDatei(uploadsPath, p2Id, "vorlage-schmerztagebuch.pdf", "Vorlage Schmerztagebuch");
            var dok4 = new Dokument
            {
                Id = NewId(), PatientId = p2Id,
                Name = "Vorlage_Schmerztagebuch.pdf", Kategorie = "vorlage",
                Dateipfad = pfad4, Dateigroesse = 980, MimeType = "application/pdf",
                HochgeladenVon = "praxis", HochgeladenVonName = "Praxis",
                Erstellt = DateTime.UtcNow.AddDays(-45)
            };

            var pfad5 = await SpeichereDatei(uploadsPath, p2Id, "rechnung-2025-002.pdf", "Rechnung 2025-002");
            var dok5 = new Dokument
            {
                Id = NewId(), PatientId = p2Id,
                Name = "Rechnung_2025-002.pdf", Kategorie = "rechnung",
                Dateipfad = pfad5, Dateigroesse = 1500, MimeType = "application/pdf",
                HochgeladenVon = "praxis", HochgeladenVonName = "Praxis",
                Erstellt = DateTime.UtcNow.AddDays(-20)
            };

            db.Dokumente.AddRange(dok4, dok5);
            await db.SaveChangesAsync();

            db.Rechnungen.Add(new Rechnung
            {
                Id = NewId(), PatientId = p2Id,
                Rechnungsnr = "2025-002", Ausstellungsdatum = DateTime.UtcNow.AddDays(-20),
                Faelligkeitsdatum = DateTime.UtcNow.AddDays(1),
                Gesamtbetrag = 65.00m, Bezahlt = false, DokumentId = dok5.Id,
                Erstellt = DateTime.UtcNow.AddDays(-20)
            });
            await db.SaveChangesAsync();
            Console.WriteLine("✓ Patient 2: thomas.schneider@example.de / Patient2024!");
        }

        // ── Ausstehende Registrierung (für Admin-Test) ─────────────────────────
        if (!db.Registrierungen.Any(r => r.Email == "klausweber@example.de"))
        {
            db.Registrierungen.Add(new Registrierung
            {
                Id = NewId(),
                Vorname = "Klaus",
                Nachname = "Weber",
                Email = "klausweber@example.de",
                Geburtsdatum = new DateTime(1968, 11, 30),
                Telefon = "02841 999888",
                DatenschutzZugestimmt = true,
                NutzungsbedingungenZugestimmt = true,
                Status = "ausstehend",
                Token = Guid.NewGuid().ToString("N"),
                Erstellt = DateTime.UtcNow.AddHours(-2)
            });
            await db.SaveChangesAsync();
            Console.WriteLine("✓ Offene Registrierung: Klaus Weber (klausweber@example.de)");
        }

        Console.WriteLine("\nZugangsdaten für lokalen Test:");
        Console.WriteLine("  Admin:      admin@example.de / Admin2024!");
        Console.WriteLine("  Patient 1:  maria.mueller@example.de / Patient2024!");
        Console.WriteLine("  Patient 2:  thomas.schneider@example.de / Patient2024!");
    }
}
