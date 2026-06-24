using PatientenPortal.Data.Models;

namespace PatientenPortal.Data;

public static class DbSeeder
{
    private static string NewId() => Guid.NewGuid().ToString("N")[..21];

    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        if (!db.Benutzer.Any(b => b.Rolle == "admin"))
        {
            var email = config["AdminEmail"] ?? "admin@example.com";
            var password = config["AdminInitialPassword"] ?? "Admin1234!";
            db.Benutzer.Add(new Benutzer
            {
                Id = NewId(),
                Email = email,
                PasswortHash = BCrypt.Net.BCrypt.HashPassword(password, 12),
                Vorname = "Admin",
                Nachname = "Hilfreich",
                Rolle = "admin",
                Status = "aktiv",
                Erstellt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }
}
