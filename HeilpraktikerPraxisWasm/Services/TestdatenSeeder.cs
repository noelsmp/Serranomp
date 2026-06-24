using Blazored.LocalStorage;
using HeilpraktikerPraxisWasm.Models;

namespace HeilpraktikerPraxisWasm.Services;

public class TestdatenSeeder(
    ILocalStorageService storage,
    PatientenService patientenSvc,
    TerminService terminSvc,
    BehandlungsService behandlungsSvc,
    RechnungsService rechnungsSvc,
    PraxisService praxisSvc)
{
    public async Task<bool> SeedIfEmptyAsync()
    {
        var seeded = await storage.GetItemAsync<bool>("seeded");
        if (seeded) return false;

        // Praxisdaten
        await praxisSvc.SpeichernAsync(new PraxisDaten
        {
            Name = "Naturheilpraxis Sonnenberg",
            Inhaberin = "Maria Sonnenberg",
            Strasse = "Kräuterweg 12",
            Plz = "80331",
            Ort = "München",
            Telefon = "089 / 12 34 56 78",
            Email = "praxis@sonnenberg-hp.de",
            Webseite = "www.sonnenberg-hp.de",
            Steuernr = "123/456/78901",
            Iban = "DE89 3704 0044 0532 0130 00",
            Bic = "COBADEFFXXX",
            Bank = "Commerzbank München",
            HeilpraktikerErlaubnis = "gem. § 1 HeilprG"
        });

        // Patienten
        var p1 = await patientenSvc.SpeichernAsync(new Patient
        {
            Anrede = "Frau", Vorname = "Anna", Nachname = "Müller",
            Geburtsdatum = new DateOnly(1978, 3, 15),
            Strasse = "Hauptstraße 42", Plz = "80333", Ort = "München",
            Telefon = "0176 111 22 33", Email = "anna.mueller@example.com",
            Versicherungsart = "GKV", Krankenkasse = "AOK Bayern",
            Beruf = "Lehrerin",
            Anamnese = "Chronische Rückenschmerzen, Migräne, gelegentliche Schlafstörungen",
            Allergien = "Hausstaub, Birkenpollenallergie",
            Dauermedikamente = "Ibuprofen bei Bedarf",
            Aktiv = true
        });

        var p2 = await patientenSvc.SpeichernAsync(new Patient
        {
            Anrede = "Herr", Vorname = "Thomas", Nachname = "Schmidt",
            Geburtsdatum = new DateOnly(1965, 7, 22),
            Strasse = "Rosenstraße 8", Plz = "80469", Ort = "München",
            Telefon = "0171 555 66 77", Email = "t.schmidt@example.com",
            Versicherungsart = "PKV", Krankenkasse = "DKV",
            Beruf = "Ingenieur",
            Anamnese = "Bluthochdruck, Stresssymptome, Burnout-Prävention",
            Aktiv = true
        });

        var p3 = await patientenSvc.SpeichernAsync(new Patient
        {
            Anrede = "Frau", Vorname = "Sarah", Nachname = "Weber",
            Geburtsdatum = new DateOnly(1990, 11, 8),
            Strasse = "Gärtnerplatz 3", Plz = "80469", Ort = "München",
            Telefon = "0160 777 88 99", Email = "sarah.weber@example.com",
            Versicherungsart = "Selbstzahler",
            Beruf = "Designerin",
            Anamnese = "Verdauungsprobleme, Erschöpfungszustände, Immunschwäche",
            Aktiv = true
        });

        // Termine
        var heute = DateTime.Today;
        await terminSvc.SpeichernAsync(new Termin
        {
            PatientId = p1.Id, Datum = heute.AddHours(9),
            DauerMinuten = 60, Art = "Akupunktur – Rücken",
            Status = TerminStatus.Geplant
        });
        await terminSvc.SpeichernAsync(new Termin
        {
            PatientId = p2.Id, Datum = heute.AddHours(11),
            DauerMinuten = 90, Art = "Osteopathie – Erstbehandlung",
            Status = TerminStatus.Geplant
        });
        await terminSvc.SpeichernAsync(new Termin
        {
            PatientId = p3.Id, Datum = heute.AddDays(1).AddHours(10),
            DauerMinuten = 60, Art = "Homöopathie – Folgetermin",
            Status = TerminStatus.Geplant
        });
        await terminSvc.SpeichernAsync(new Termin
        {
            PatientId = p1.Id, Datum = heute.AddDays(-3).AddHours(9),
            DauerMinuten = 60, Art = "Akupunktur – Rücken",
            Status = TerminStatus.Erschienen
        });

        // Behandlungen
        await behandlungsSvc.SpeichernAsync(new Behandlung
        {
            PatientId = p1.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-3)),
            Therapeut = "Maria Sonnenberg",
            Diagnose = "Chronische Lumbalgie, HWS-Syndrom",
            Therapie = "Körperakupunktur (C 1) – 12 Nadeln, Schultergürtel und LWS",
            Befund = "Deutliche Verspannungen im M. trapezius beidseits, Druckschmerz L4/L5",
            Verlauf = "Erste Entspannung nach 20 Minuten, Patient berichtet von weniger Schmerzen",
            NaechsteSchritte = "Nächste Akupunktur in einer Woche, Stretching-Übungen täglich",
            Medikamente = "Arnica-Tropfen D6, 3x täglich 5 Tropfen"
        });
        await behandlungsSvc.SpeichernAsync(new Behandlung
        {
            PatientId = p2.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-7)),
            Therapeut = "Maria Sonnenberg",
            Diagnose = "Hypertonie, Stressreaktion, Burnout-Syndrom",
            Therapie = "Osteopathische Behandlung (F 1) – viszerale Techniken, craniosacraler Rhythmus",
            Befund = "Eingeschränkte Beweglichkeit der Brustwirbelsäule, Spannungskopfschmerzen",
            Verlauf = "Patient entspannte sich gut, Atemfrequenz normalisierte sich",
            NaechsteSchritte = "Entspannungsübungen, Autogenes Training empfohlen (H 4)"
        });

        // Rechnungen
        var r1 = new Rechnung
        {
            PatientId = p1.Id,
            Ausstellungsdatum = DateOnly.FromDateTime(heute.AddDays(-3)),
            Faelligkeitsdatum = DateOnly.FromDateTime(heute.AddDays(11)),
            Positionen =
            [
                new RechnungsPosition { Ziffer = "A 2", Leistung = "Eingehende Anamnese und Beratung (Folgepatient)", Einheit = "je Behandlung", Anzahl = 1, Einzelpreis = 15.00m },
                new RechnungsPosition { Ziffer = "C 1", Leistung = "Körperakupunktur (je Sitzung)", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 35.00m },
            ],
            MwstSatz = 0,
            Bezahlt = false
        };
        await rechnungsSvc.SpeichernAsync(r1);

        var r2 = new Rechnung
        {
            PatientId = p2.Id,
            Ausstellungsdatum = DateOnly.FromDateTime(heute.AddDays(-7)),
            Faelligkeitsdatum = DateOnly.FromDateTime(heute.AddDays(7)),
            Positionen =
            [
                new RechnungsPosition { Ziffer = "A 1", Leistung = "Eingehende Anamnese und Beratung (Erstpatient)", Einheit = "je Behandlung", Anzahl = 1, Einzelpreis = 25.00m },
                new RechnungsPosition { Ziffer = "F 1", Leistung = "Osteopathische Behandlung (45 Min.)", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 75.00m },
                new RechnungsPosition { Ziffer = "G 3", Leistung = "Blutdruckmessung", Einheit = "je Messung", Anzahl = 2, Einzelpreis = 3.00m },
            ],
            MwstSatz = 0,
            Bezahlt = true,
            BezahltAm = DateTime.Now.AddDays(-2),
            Zahlungsart = "Überweisung"
        };
        await rechnungsSvc.SpeichernAsync(r2);

        await storage.SetItemAsync("seeded", true);
        return true;
    }
}
