using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Data;

public class PraxisDbContext(DbContextOptions<PraxisDbContext> options) : DbContext(options)
{
    public DbSet<Patient> Patienten => Set<Patient>();
    public DbSet<Termin> Termine => Set<Termin>();
    public DbSet<Rechnung> Rechnungen => Set<Rechnung>();
    public DbSet<RechnungsPosition> RechnungsPositionen => Set<RechnungsPosition>();
    public DbSet<Behandlung> Behandlungen => Set<Behandlung>();
    public DbSet<Dokument> Dokumente => Set<Dokument>();
    public DbSet<PraxisDaten> PraxisDaten => Set<PraxisDaten>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Patient>().HasIndex(p => p.PatientNr).IsUnique();
        b.Entity<Rechnung>().HasIndex(r => r.Rechnungsnr).IsUnique();

        b.Entity<Rechnung>()
            .HasMany(r => r.Positionen)
            .WithOne(p => p.Rechnung)
            .HasForeignKey(p => p.RechnungId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Patient>()
            .HasMany(p => p.Rechnungen)
            .WithOne(r => r.Patient)
            .HasForeignKey(r => r.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Patient>()
            .HasMany(p => p.Termine)
            .WithOne(t => t.Patient)
            .HasForeignKey(t => t.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Patient>()
            .HasMany(p => p.Behandlungen)
            .WithOne(b => b.Patient)
            .HasForeignKey(b => b.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Patient>()
            .HasMany(p => p.Dokumente)
            .WithOne(d => d.Patient)
            .HasForeignKey(d => d.PatientId)
            .OnDelete(DeleteBehavior.SetNull);

        // Seed Praxisdaten
        b.Entity<PraxisDaten>().HasData(new PraxisDaten
        {
            Id = 1,
            Name = "Naturheilpraxis",
            Inhaberin = "Heilpraktikerin",
            Strasse = "Musterstraße 1",
            Plz = "12345",
            Ort = "Musterstadt",
            Telefon = "0123 456789",
            Email = "praxis@example.de",
            HeilpraktikerErlaubnis = "gem. § 1 HeilprG"
        });
    }
}
