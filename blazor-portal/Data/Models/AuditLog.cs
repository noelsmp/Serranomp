namespace PatientenPortal.Data.Models;

public class AuditLog
{
    public string Id { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string Aktion { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAdresse { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.UtcNow;
}
