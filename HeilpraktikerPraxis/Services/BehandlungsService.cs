using HeilpraktikerPraxis.Data;
using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Services;

public class BehandlungsService(IDbContextFactory<PraxisDbContext> dbFactory)
{
    public async Task<List<Behandlung>> AlleBehandlungenAsync(int? patientId = null)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var q = db.Behandlungen.Include(b => b.Patient).AsQueryable();
        if (patientId.HasValue) q = q.Where(b => b.PatientId == patientId.Value);
        return await q.OrderByDescending(b => b.Datum).ToListAsync();
    }

    public async Task<Behandlung?> GetBehandlungAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Behandlungen
            .Include(b => b.Patient)
            .Include(b => b.Termin)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Behandlung> SpeichernAsync(Behandlung behandlung)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        behandlung.Geaendert = DateTime.Now;
        if (behandlung.Id == 0) { behandlung.Erstellt = DateTime.Now; db.Behandlungen.Add(behandlung); }
        else db.Behandlungen.Update(behandlung);
        await db.SaveChangesAsync();
        return behandlung;
    }

    public async Task LoeschenAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var b = await db.Behandlungen.FindAsync(id);
        if (b is not null) { db.Behandlungen.Remove(b); await db.SaveChangesAsync(); }
    }
}
