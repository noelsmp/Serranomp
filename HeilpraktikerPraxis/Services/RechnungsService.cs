using HeilpraktikerPraxis.Data;
using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Services;

public class RechnungsService(IDbContextFactory<PraxisDbContext> dbFactory)
{
    public async Task<List<Rechnung>> AlleRechnungenAsync(string? suche = null)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var q = db.Rechnungen.Include(r => r.Patient).AsQueryable();
        if (!string.IsNullOrWhiteSpace(suche))
            q = q.Where(r => r.Rechnungsnr.Contains(suche) ||
                              (r.Patient != null && (r.Patient.Nachname.Contains(suche) || r.Patient.Vorname.Contains(suche))));
        return await q.OrderByDescending(r => r.Ausstellungsdatum).ToListAsync();
    }

    public async Task<Rechnung?> GetRechnungAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Rechnungen
            .Include(r => r.Patient)
            .Include(r => r.Positionen)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<List<Rechnung>> RechnungenFuerPatientAsync(int patientId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Rechnungen
            .Include(r => r.Positionen)
            .Where(r => r.PatientId == patientId)
            .OrderByDescending(r => r.Ausstellungsdatum)
            .ToListAsync();
    }

    public async Task<Rechnung> SpeichernAsync(Rechnung rechnung)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        // Summen berechnen
        rechnung.Zwischensumme = rechnung.Positionen.Sum(p => p.Einzelpreis * p.Anzahl);
        rechnung.MwstBetrag = Math.Round(rechnung.Zwischensumme * rechnung.MwstSatz / 100, 2);
        rechnung.Gesamtbetrag = rechnung.Zwischensumme + rechnung.MwstBetrag;

        if (rechnung.Id == 0)
        {
            rechnung.Rechnungsnr = await GenerateRechnungsNrAsync(db);
            rechnung.Erstellt = DateTime.Now;
            db.Rechnungen.Add(rechnung);
        }
        else
        {
            var existing = await db.Rechnungen.Include(r => r.Positionen).FirstAsync(r => r.Id == rechnung.Id);
            db.RechnungsPositionen.RemoveRange(existing.Positionen);
            existing.PatientId = rechnung.PatientId;
            existing.Ausstellungsdatum = rechnung.Ausstellungsdatum;
            existing.Faelligkeitsdatum = rechnung.Faelligkeitsdatum;
            existing.Positionen = rechnung.Positionen;
            existing.Zwischensumme = rechnung.Zwischensumme;
            existing.MwstSatz = rechnung.MwstSatz;
            existing.MwstBetrag = rechnung.MwstBetrag;
            existing.Gesamtbetrag = rechnung.Gesamtbetrag;
            existing.Notizen = rechnung.Notizen;
            existing.Bezahlt = rechnung.Bezahlt;
            existing.BezahltAm = rechnung.BezahltAm;
            existing.Zahlungsart = rechnung.Zahlungsart;
        }
        await db.SaveChangesAsync();
        return rechnung;
    }

    public async Task AlsBeahltMarkierenAsync(int id, string zahlungsart)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var r = await db.Rechnungen.FindAsync(id);
        if (r is null) return;
        r.Bezahlt = true;
        r.BezahltAm = DateTime.Now;
        r.Zahlungsart = zahlungsart;
        await db.SaveChangesAsync();
    }

    public async Task LoeschenAsync(int id)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var r = await db.Rechnungen.Include(r => r.Positionen).FirstOrDefaultAsync(r => r.Id == id);
        if (r is not null) { db.Rechnungen.Remove(r); await db.SaveChangesAsync(); }
    }

    public async Task<decimal> OffenerBetragAsync()
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.Rechnungen.Where(r => !r.Bezahlt).SumAsync(r => r.Gesamtbetrag);
    }

    public async Task<decimal> UmsatzMonatAsync()
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var ersterDesMonats = new DateOnly(DateTime.Today.Year, DateTime.Today.Month, 1);
        return await db.Rechnungen
            .Where(r => r.Bezahlt && r.BezahltAm.HasValue && r.BezahltAm.Value.Month == DateTime.Today.Month && r.BezahltAm.Value.Year == DateTime.Today.Year)
            .SumAsync(r => r.Gesamtbetrag);
    }

    private static async Task<string> GenerateRechnungsNrAsync(PraxisDbContext db)
    {
        var jetzt = DateTime.Now;
        var prefix = $"RE-{jetzt.Year}{jetzt.Month:D2}";
        var count = await db.Rechnungen.CountAsync(r => r.Rechnungsnr.StartsWith(prefix)) + 1;
        return $"{prefix}-{count:D3}";
    }
}
