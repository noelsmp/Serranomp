using HeilpraktikerPraxis.Data;
using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Services;

public class DokumentService(IDbContextFactory<PraxisDbContext> dbFactory)
{
    public async Task<List<Dokument>> AlleDokumenteAsync(int? patientId = null, DokumentKategorie? kategorie = null)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var q = db.Dokumente.Include(d => d.Patient).AsQueryable();
        if (patientId.HasValue) q = q.Where(d => d.PatientId == patientId.Value);
        if (kategorie.HasValue) q = q.Where(d => d.Kategorie == kategorie.Value);
        return await q.OrderByDescending(d => d.Erstellt).Select(d => new Dokument
        {
            Id = d.Id, PatientId = d.PatientId, Patient = d.Patient,
            Name = d.Name, Typ = d.Typ, Kategorie = d.Kategorie,
            Beschreibung = d.Beschreibung, Groesse = d.Groesse, Erstellt = d.Erstellt,
            Daten = Array.Empty<byte>() // Daten nicht im Listing laden
        }).ToListAsync();
    }

    public async Task<Dokument?> GetDokumentAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Dokumente.Include(d => d.Patient).FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Dokument> SpeichernAsync(Dokument dokument)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        dokument.Groesse = dokument.Daten.Length;
        if (dokument.Id == 0) { dokument.Erstellt = DateTime.Now; db.Dokumente.Add(dokument); }
        else db.Dokumente.Update(dokument);
        await db.SaveChangesAsync();
        return dokument;
    }

    public async Task LoeschenAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var d = await db.Dokumente.FindAsync(id);
        if (d is not null) { db.Dokumente.Remove(d); await db.SaveChangesAsync(); }
    }
}
