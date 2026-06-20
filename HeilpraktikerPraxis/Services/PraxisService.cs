using HeilpraktikerPraxis.Data;
using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Services;

public class PraxisService(IDbContextFactory<PraxisDbContext> dbFactory)
{
    public async Task<PraxisDaten> GetPraxisDatenAsync()
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.PraxisDaten.FirstOrDefaultAsync()
               ?? new PraxisDaten { Id = 1, Name = "Naturheilpraxis" };
    }

    public async Task SpeichernAsync(PraxisDaten daten)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var existing = await db.PraxisDaten.FindAsync(daten.Id);
        if (existing is null) db.PraxisDaten.Add(daten);
        else
        {
            db.Entry(existing).CurrentValues.SetValues(daten);
            if (daten.Logo is not null) existing.Logo = daten.Logo;
        }
        await db.SaveChangesAsync();
    }
}
