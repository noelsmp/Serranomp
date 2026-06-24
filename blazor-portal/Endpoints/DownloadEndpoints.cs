using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PatientenPortal.Data;
using PatientenPortal.Services;

namespace PatientenPortal.Endpoints;

public static class DownloadEndpoints
{
    public static void MapDownloadEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/download/{id}", async (
            string id,
            AppDbContext db,
            StorageService storageService,
            HttpContext httpContext) =>
        {
            if (!httpContext.User.Identity?.IsAuthenticated == true)
                return Results.Unauthorized();

            var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolle = httpContext.User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Results.Unauthorized();

            var dokument = await db.Dokumente.FindAsync(id);
            if (dokument == null)
                return Results.NotFound("Dokument nicht gefunden.");

            // Patients can only download their own documents; admins can download any
            if (rolle != "admin" && dokument.PatientId != userId)
                return Results.Forbid();

            var absolutePath = storageService.GetAbsolutePath(dokument.Dateipfad);
            if (!File.Exists(absolutePath))
                return Results.NotFound("Datei nicht gefunden.");

            var fileStream = new FileStream(absolutePath, FileMode.Open, FileAccess.Read);
            var contentType = dokument.MimeType.Length > 0 ? dokument.MimeType : "application/octet-stream";

            return Results.File(fileStream, contentType, dokument.Name);
        }).RequireAuthorization();
    }
}
