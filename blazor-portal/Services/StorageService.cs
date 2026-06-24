namespace PatientenPortal.Services;

public class StorageService
{
    private readonly IConfiguration _config;
    private readonly ILogger<StorageService> _logger;

    public StorageService(IConfiguration config, ILogger<StorageService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public string GetUploadPath()
    {
        var path = _config["UploadsPath"] ?? "/var/data/patientenportal/uploads";
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
        return path;
    }

    public async Task<string> SaveAsync(Stream stream, string filename)
    {
        var uploadPath = GetUploadPath();
        var safeFilename = SanitizeFilename(filename);
        var uniqueName = $"{Guid.NewGuid():N}_{safeFilename}";
        var fullPath = Path.Combine(uploadPath, uniqueName);

        using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await stream.CopyToAsync(fileStream);

        return uniqueName;
    }

    public void Delete(string relativePath)
    {
        try
        {
            var fullPath = GetAbsolutePath(relativePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Löschen der Datei: {Path}", relativePath);
        }
    }

    public string GetAbsolutePath(string relativePath)
    {
        var uploadPath = GetUploadPath();
        return Path.Combine(uploadPath, relativePath);
    }

    private static string SanitizeFilename(string filename)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Concat(filename.Select(c => invalidChars.Contains(c) ? '_' : c));
        return sanitized.Length > 200 ? sanitized[^200..] : sanitized;
    }
}
