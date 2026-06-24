using Microsoft.EntityFrameworkCore;
using PatientenPortal.Data.Models;

namespace PatientenPortal.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Benutzer> Benutzer { get; set; } = default!;
    public DbSet<Registrierung> Registrierungen { get; set; } = default!;
    public DbSet<Dokument> Dokumente { get; set; } = default!;
    public DbSet<Rechnung> Rechnungen { get; set; } = default!;
    public DbSet<AuditLog> AuditLogs { get; set; } = default!;
    public DbSet<DsgvoAnfrage> DsgvoAnfragen { get; set; } = default!;
    public DbSet<PasswortResetToken> PasswortResetTokens { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Benutzer
        modelBuilder.Entity<Benutzer>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => b.Email).IsUnique();
        });

        // Registrierung
        modelBuilder.Entity<Registrierung>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.Token).IsUnique();
        });

        // Dokument
        modelBuilder.Entity<Dokument>(e =>
        {
            e.HasKey(d => d.Id);
            e.HasIndex(d => d.PatientId);
            e.HasOne(d => d.Patient)
             .WithMany(b => b.Dokumente)
             .HasForeignKey(d => d.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Rechnung
        modelBuilder.Entity<Rechnung>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.PatientId);
            e.Property(r => r.Gesamtbetrag).HasColumnType("TEXT");
            e.HasOne(r => r.Patient)
             .WithMany(b => b.Rechnungen)
             .HasForeignKey(r => r.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Dokument)
             .WithOne(d => d.Rechnung)
             .HasForeignKey<Rechnung>(r => r.DokumentId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(a => a.Id);
        });

        // DsgvoAnfrage
        modelBuilder.Entity<DsgvoAnfrage>(e =>
        {
            e.HasKey(d => d.Id);
            e.HasOne(d => d.Patient)
             .WithMany(b => b.DsgvoAnfragen)
             .HasForeignKey(d => d.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // PasswortResetToken
        modelBuilder.Entity<PasswortResetToken>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.Token).IsUnique();
            e.HasOne(p => p.User)
             .WithMany(b => b.PasswortResetTokens)
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
