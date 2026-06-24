using HeilpraktikerPraxis.Data;
using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Services;

public class PatientenService(IDbContextFactory<PraxisDbContext> dbFactory)
{
    public async Task<List<Patient>> AllePatientenAsync(string? suche = null)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var q = db.Patienten.Where(p => p.Aktiv);
        if (!string.IsNullOrWhiteSpace(suche))
            q = q.Where(p => p.Nachname.Contains(suche) || p.Vorname.Contains(suche) || p.PatientNr.Contains(suche));
        return await q.OrderBy(p => p.Nachname).ThenBy(p => p.Vorname).ToListAsync();
    }

    public async Task<Patient?> GetPatientAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Patienten
            .Include(p => p.Termine.OrderByDescending(t => t.Datum))
            .Include(p => p.Behandlungen.OrderByDescending(b => b.Datum))
            .Include(p => p.Rechnungen.OrderByDescending(r => r.Ausstellungsdatum))
            .Include(p => p.Dokumente.OrderByDescending(d => d.Erstellt))
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Patient> SpeichernAsync(Patient patient)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        if (patient.Id == 0)
        {
            patient.PatientNr = await GeneratePatientNrAsync(db);
            patient.Erstellt = DateTime.Now;
            db.Patienten.Add(patient);
        }
        else
        {
            db.Patienten.Update(patient);
        }
        await db.SaveChangesAsync();
        return patient;
    }

    public async Task LoeschenAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var p = await db.Patienten.FindAsync(id);
        if (p is not null) { p.Aktiv = false; await db.SaveChangesAsync(); }
    }

    public async Task<int> AnzahlPatientenAsync()
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Patienten.CountAsync(p => p.Aktiv);
    }

    private static async Task<string> GeneratePatientNrAsync(PraxisDbContext db)
    {
        var year = DateTime.Now.Year.ToString()[2..];
        var count = await db.Patienten.CountAsync() + 1;
        return $"P{year}-{count:D4}";
    }
}
