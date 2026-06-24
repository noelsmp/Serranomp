using PatientenPortal.Data;
using PatientenPortal.Data.Models;

namespace PatientenPortal.Services;

public class AuditService
{
    private static string NewId() => Guid.NewGuid().ToString("N")[..21];

    public async Task LogAsync(AppDbContext db, string? userId, string aktion,
        string? details = null, string? ipAdresse = null)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Id = NewId(),
            UserId = userId,
            Aktion = aktion,
            Details = details,
            IpAdresse = ipAdresse,
            Erstellt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }
}
