using HeilpraktikerPraxis.Data;
using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Services;

public class TerminService(IDbContextFactory<PraxisDbContext> dbFactory)
{
    public async Task<List<Termin>> AlleTermineAsync(DateTime? von = null, DateTime? bis = null)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var q = db.Termine.Include(t => t.Patient).AsQueryable();
        if (von.HasValue) q = q.Where(t => t.Datum >= von.Value);
        if (bis.HasValue) q = q.Where(t => t.Datum <= bis.Value);
        return await q.OrderBy(t => t.Datum).ToListAsync();
    }

    public async Task<List<Termin>> TermineFuerPatientAsync(int patientId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Termine
            .Where(t => t.PatientId == patientId)
            .OrderByDescending(t => t.Datum)
            .ToListAsync();
    }

    public async Task<Termin?> GetTerminAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Termine.Include(t => t.Patient).FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Termin> SpeichernAsync(Termin termin)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        if (termin.Id == 0) db.Termine.Add(termin);
        else db.Termine.Update(termin);
        await db.SaveChangesAsync();
        return termin;
    }

    public async Task LoeschenAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var t = await db.Termine.FindAsync(id);
        if (t is not null) { db.Termine.Remove(t); await db.SaveChangesAsync(); }
    }

    public async Task<int> HeuteTermineAsync()
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var heute = DateTime.Today;
        return await db.Termine.CountAsync(t => t.Datum.Date == heute && t.Status == TerminStatus.Geplant);
    }

    public async Task<List<Termin>> NaechsteTermineAsync(int anzahl = 5)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var jetzt = DateTime.Now;
        return await db.Termine
            .Include(t => t.Patient)
            .Where(t => t.Datum >= jetzt && t.Status == TerminStatus.Geplant)
            .OrderBy(t => t.Datum)
            .Take(anzahl)
            .ToListAsync();
    }
}
