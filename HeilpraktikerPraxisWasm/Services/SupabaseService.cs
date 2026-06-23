using System.Net.Http.Headers;
using System.Net.Http.Json;
using HeilpraktikerPraxisWasm.Models;

namespace HeilpraktikerPraxisWasm.Services;

public class SupabaseService
{
    private readonly HttpClient _http;

    // ── Hier Supabase-Zugangsdaten eintragen ──────────────────────────────
    private const string SupabaseUrl = "https://ekezfsgpwkockqmllwvb.supabase.co";
    private const string AnonKey     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZXpmc2dwd2tvY2txbWxsd3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzE4MTIsImV4cCI6MjA5NzgwNzgxMn0.Ly12TlbcxcEaYy_8U-e8f8J7oXu8tn71HYJ-qsaAO8A";
    // ──────────────────────────────────────────────────────────────────────

    private string? _accessToken;
    private string? _refreshToken;

    public bool IsLoggedIn => _accessToken != null;
    public SupabaseUser? CurrentUser { get; private set; }
    public PatientPortalProfil? Profil { get; private set; }

    public SupabaseService(HttpClient http) => _http = http;

    // ── Auth ──────────────────────────────────────────────────────────────

    public async Task<(bool ok, string? fehler)> LoginAsync(string email, string password)
    {
        var req = Req(HttpMethod.Post, "/auth/v1/token?grant_type=password");
        req.Content = JsonContent.Create(new { email, password });
        var resp = await _http.SendAsync(req);

        if (!resp.IsSuccessStatusCode)
            return (false, "E-Mail oder Passwort falsch.");

        var auth = await resp.Content.ReadFromJsonAsync<SupabaseAuthResponse>();
        _accessToken  = auth?.AccessToken;
        _refreshToken = auth?.RefreshToken;
        CurrentUser   = auth?.User;
        Profil        = await LadeProfil();
        return (_accessToken != null, null);
    }

    public async Task LogoutAsync()
    {
        if (_accessToken == null) return;
        await _http.SendAsync(Req(HttpMethod.Post, "/auth/v1/logout"));
        _accessToken  = null;
        _refreshToken = null;
        CurrentUser   = null;
        Profil        = null;
    }

    // ── Profil ────────────────────────────────────────────────────────────

    private async Task<PatientPortalProfil?> LadeProfil()
    {
        var resp = await _http.SendAsync(Req(HttpMethod.Get, "/rest/v1/patient_profiles?select=*&limit=1"));
        if (!resp.IsSuccessStatusCode) return null;
        var list = await resp.Content.ReadFromJsonAsync<List<PatientPortalProfil>>();
        return list?.FirstOrDefault();
    }

    // ── Rechnungen ────────────────────────────────────────────────────────

    public async Task<List<PortalRechnung>> HoleRechnungenAsync()
    {
        var resp = await _http.SendAsync(
            Req(HttpMethod.Get, "/rest/v1/portal_rechnungen?select=*&order=ausstellungsdatum.desc"));
        if (!resp.IsSuccessStatusCode) return [];
        return await resp.Content.ReadFromJsonAsync<List<PortalRechnung>>() ?? [];
    }

    // ── Dokumente ─────────────────────────────────────────────────────────

    public async Task<List<PortalDokument>> HoleDokumenteAsync(string? typ = null)
    {
        var filter = typ != null ? $"&typ=eq.{typ}" : "";
        var resp = await _http.SendAsync(
            Req(HttpMethod.Get, $"/rest/v1/portal_dokumente?select=*&order=erstellt.desc{filter}"));
        if (!resp.IsSuccessStatusCode) return [];
        return await resp.Content.ReadFromJsonAsync<List<PortalDokument>>() ?? [];
    }

    public async Task<bool> UploadDokumentAsync(string dateiname, string typ, byte[] data, string mimeType)
    {
        if (CurrentUser == null) return false;
        var path = $"{CurrentUser.Id}/{typ}/{dateiname}";

        // 1. Datei in Storage hochladen
        var uploadReq = Req(HttpMethod.Post, $"/storage/v1/object/patient-files/{path}");
        uploadReq.Content = new ByteArrayContent(data);
        uploadReq.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
        var uploadResp = await _http.SendAsync(uploadReq);
        if (!uploadResp.IsSuccessStatusCode) return false;

        // 2. Metadaten in Datenbank speichern
        var dbReq = Req(HttpMethod.Post, "/rest/v1/portal_dokumente");
        dbReq.Headers.Add("Prefer", "return=minimal");
        dbReq.Content = JsonContent.Create(new
        {
            patient_id  = CurrentUser.Id,
            name        = dateiname,
            typ,
            storage_path = path,
            uploaded_by  = "patient"
        });
        return (await _http.SendAsync(dbReq)).IsSuccessStatusCode;
    }

    public async Task<string?> GetSignedDownloadUrlAsync(string storagePath)
    {
        var req = Req(HttpMethod.Post, $"/storage/v1/object/sign/patient-files/{storagePath}");
        req.Content = JsonContent.Create(new { expiresIn = 300 });
        var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode) return null;
        var result = await resp.Content.ReadFromJsonAsync<SupabaseSignedUrlResponse>();
        return result?.SignedUrl != null ? $"{SupabaseUrl}{result.SignedUrl}" : null;
    }

    // ── DSGVO ─────────────────────────────────────────────────────────────

    public async Task<bool> SendeDatenschutzanfrageAsync(string typ, string nachricht)
    {
        if (CurrentUser == null) return false;
        var req = Req(HttpMethod.Post, "/rest/v1/portal_dsgvo_anfragen");
        req.Headers.Add("Prefer", "return=minimal");
        req.Content = JsonContent.Create(new
        {
            patient_id = CurrentUser.Id,
            email      = CurrentUser.Email,
            typ,
            nachricht
        });
        return (await _http.SendAsync(req)).IsSuccessStatusCode;
    }

    // ── Hilfsmethoden ─────────────────────────────────────────────────────

    private HttpRequestMessage Req(HttpMethod method, string path)
    {
        var req = new HttpRequestMessage(method, $"{SupabaseUrl}{path}");
        req.Headers.Add("apikey", AnonKey);
        req.Headers.Add("Accept", "application/json");
        if (_accessToken != null)
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        return req;
    }
}
