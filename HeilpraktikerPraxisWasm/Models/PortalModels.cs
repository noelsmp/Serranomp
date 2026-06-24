using System.Text.Json.Serialization;

namespace HeilpraktikerPraxisWasm.Models;

public class SupabaseAuthResponse
{
    [JsonPropertyName("access_token")] public string? AccessToken { get; set; }
    [JsonPropertyName("refresh_token")] public string? RefreshToken { get; set; }
    [JsonPropertyName("user")] public SupabaseUser? User { get; set; }
}

public class SupabaseUser
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("email")] public string Email { get; set; } = "";
}

public class PatientPortalProfil
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("vorname")] public string Vorname { get; set; } = "";
    [JsonPropertyName("nachname")] public string Nachname { get; set; } = "";
    [JsonPropertyName("email")] public string Email { get; set; } = "";
    [JsonPropertyName("geburtsdatum")] public string? Geburtsdatum { get; set; }
    [JsonPropertyName("praxis_patient_nr")] public string? PraxisPatientNr { get; set; }
    public string VollerName => $"{Vorname} {Nachname}".Trim();
}

public class PortalRechnung
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("rechnungsnr")] public string Rechnungsnr { get; set; } = "";
    [JsonPropertyName("ausstellungsdatum")] public string Ausstellungsdatum { get; set; } = "";
    [JsonPropertyName("faelligkeitsdatum")] public string Faelligkeitsdatum { get; set; } = "";
    [JsonPropertyName("gesamtbetrag")] public decimal Gesamtbetrag { get; set; }
    [JsonPropertyName("bezahlt")] public bool Bezahlt { get; set; }
    [JsonPropertyName("pdf_storage_path")] public string? PdfStoragePath { get; set; }
    [JsonPropertyName("erstellt")] public string Erstellt { get; set; } = "";
}

public class PortalDokument
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("typ")] public string Typ { get; set; } = "";
    [JsonPropertyName("storage_path")] public string StoragePath { get; set; } = "";
    [JsonPropertyName("uploaded_by")] public string UploadedBy { get; set; } = "patient";
    [JsonPropertyName("erstellt")] public string Erstellt { get; set; } = "";
}

public class SupabaseSignedUrlResponse
{
    [JsonPropertyName("signedURL")] public string? SignedUrl { get; set; }
}
