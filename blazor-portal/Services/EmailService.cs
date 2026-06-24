using System.Text;
using System.Text.Json;

namespace PatientenPortal.Services;

public class EmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly string _apiKey;
    private readonly string _from;
    private readonly ILogger<EmailService> _logger;

    public EmailService(HttpClient httpClient, IConfiguration config, ILogger<EmailService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
        _apiKey = config["ResendApiKey"] ?? string.Empty;
        _from = config["EmailFrom"] ?? "portal@naturheilpraxis-hilfreich.de";
    }

    public async Task SendAsync(string to, string subject, string html)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("ResendApiKey nicht konfiguriert. E-Mail nicht gesendet: {Subject} an {To}", subject, to);
            return;
        }

        var payload = new
        {
            from = _from,
            to = new[] { to },
            subject,
            html
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Add("Authorization", $"Bearer {_apiKey}");
        request.Content = content;

        try
        {
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Resend API Fehler: {Status} - {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Senden der E-Mail an {To}", to);
        }
    }

    private string BaseTemplate(string title, string bodyContent) => $"""
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{title}</title>
          <style>
            body {{ font-family: Arial, sans-serif; background: #f9f6f0; margin: 0; padding: 20px; color: #2d2d2d; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background: #4e6b53; padding: 32px 24px; text-align: center; }}
            .header h1 {{ color: #fff; margin: 0; font-family: Georgia, serif; font-size: 22px; }}
            .header p {{ color: #eaf2eb; margin: 8px 0 0; font-size: 14px; }}
            .content {{ padding: 32px 24px; }}
            .content p {{ line-height: 1.6; margin: 0 0 16px; }}
            .btn {{ display: inline-block; background: #4e6b53; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 8px 4px; }}
            .btn-danger {{ background: #9b4444; }}
            .info-box {{ background: #eaf2eb; border-left: 4px solid #4e6b53; padding: 16px; border-radius: 4px; margin: 16px 0; }}
            .footer {{ background: #f9f6f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #6b6b6b; border-top: 1px solid #ddd5c8; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Naturheilpraxis Hilfreich</h1>
              <p>Patientenportal</p>
            </div>
            <div class="content">
              {bodyContent}
            </div>
            <div class="footer">
              <p>Naturheilpraxis Hilfreich &bull; Patientenportal</p>
              <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
          </div>
        </body>
        </html>
        """;

    public async Task SendRegistrierungsbestaetigung(
        string adminEmail, string vorname, string nachname, string email,
        string freischaltenLink, string ablehnenLink)
    {
        var body = $"""
            <p>Hallo Admin,</p>
            <p>ein neuer Patient hat sich für das Patientenportal registriert und wartet auf Freischaltung:</p>
            <div class="info-box">
              <p><strong>Name:</strong> {vorname} {nachname}</p>
              <p><strong>E-Mail:</strong> {email}</p>
            </div>
            <p>Bitte überprüfen Sie die Anfrage und schalten Sie den Patienten frei oder lehnen Sie die Anfrage ab:</p>
            <p>
              <a href="{freischaltenLink}" class="btn">Patient freischalten</a>
              <a href="{ablehnenLink}" class="btn btn-danger">Anfrage ablehnen</a>
            </p>
            <p>Sie können die Anfragen auch im Admin-Bereich des Portals verwalten.</p>
            """;

        await SendAsync(adminEmail, $"Neue Registrierungsanfrage: {vorname} {nachname}",
            BaseTemplate("Neue Registrierungsanfrage", body));
    }

    public async Task SendFreischaltungBestaetigung(string to, string vorname, string loginLink, string tempPasswort)
    {
        var body = $"""
            <p>Hallo {vorname},</p>
            <p>wir freuen uns, Ihnen mitteilen zu können, dass Ihr Zugang zum Patientenportal der Naturheilpraxis Hilfreich freigeschaltet wurde.</p>
            <div class="info-box">
              <p><strong>Ihre Zugangsdaten:</strong></p>
              <p><strong>E-Mail:</strong> {to}</p>
              <p><strong>Temporäres Passwort:</strong> {tempPasswort}</p>
            </div>
            <p>Bitte melden Sie sich jetzt an und ändern Sie Ihr Passwort bei der ersten Anmeldung:</p>
            <p><a href="{loginLink}" class="btn">Zum Patientenportal</a></p>
            <p style="color: #9b4444; font-size: 14px;"><strong>Wichtig:</strong> Bitte ändern Sie Ihr temporäres Passwort nach der ersten Anmeldung in Ihrem Profil.</p>
            """;

        await SendAsync(to, "Ihr Patientenportal-Zugang wurde freigeschaltet",
            BaseTemplate("Zugang freigeschaltet", body));
    }

    public async Task SendAblehnung(string to, string vorname, string nachname, string praxisEmail, string praxisTelefon)
    {
        var body = $"""
            <p>Sehr geehrte/r {vorname} {nachname},</p>
            <p>vielen Dank für Ihr Interesse am Patientenportal der Naturheilpraxis Hilfreich.</p>
            <p>Leider konnten wir Ihre Registrierungsanfrage in unserem System nicht zuordnen. Um Zugang zum Portal zu erhalten, müssen Sie als Patient in unserer Praxis registriert sein.</p>
            <p>Wenn Sie der Meinung sind, dass dies ein Fehler ist oder wenn Sie Fragen haben, kontaktieren Sie uns bitte direkt:</p>
            <div class="info-box">
              <p><strong>E-Mail:</strong> <a href="mailto:{praxisEmail}">{praxisEmail}</a></p>
              <p><strong>Telefon:</strong> {praxisTelefon}</p>
            </div>
            <p>Mit freundlichen Grüßen,<br>Ihr Team der Naturheilpraxis Hilfreich</p>
            """;

        await SendAsync(to, "Ihre Registrierungsanfrage beim Patientenportal",
            BaseTemplate("Registrierungsanfrage", body));
    }

    public async Task SendPasswortReset(string to, string vorname, string resetLink)
    {
        var body = $"""
            <p>Hallo {vorname},</p>
            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den folgenden Link, um ein neues Passwort festzulegen:</p>
            <p><a href="{resetLink}" class="btn">Passwort zurücksetzen</a></p>
            <div class="info-box">
              <p><strong>Hinweis:</strong> Dieser Link ist nur 1 Stunde gültig.</p>
            </div>
            <p>Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.</p>
            """;

        await SendAsync(to, "Passwort zurücksetzen – Patientenportal",
            BaseTemplate("Passwort zurücksetzen", body));
    }

    public async Task SendDokumentBereitgestellt(string to, string vorname, string dateiname, string kategorie, string portalLink)
    {
        var body = $"""
            <p>Hallo {vorname},</p>
            <p>in Ihrem Patientenportal wurde ein neues Dokument für Sie bereitgestellt:</p>
            <div class="info-box">
              <p><strong>Dokument:</strong> {dateiname}</p>
              <p><strong>Kategorie:</strong> {kategorie}</p>
            </div>
            <p>Sie können das Dokument jetzt in Ihrem Portal abrufen:</p>
            <p><a href="{portalLink}" class="btn">Zum Patientenportal</a></p>
            """;

        await SendAsync(to, $"Neues Dokument verfügbar: {dateiname}",
            BaseTemplate("Neues Dokument verfügbar", body));
    }
}
