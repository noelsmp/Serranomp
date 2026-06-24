namespace PatientenPortal.Data.Models;

public class PasswortResetToken
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime Ablauf { get; set; }
    public DateTime Erstellt { get; set; } = DateTime.UtcNow;

    public Benutzer? User { get; set; }
}
