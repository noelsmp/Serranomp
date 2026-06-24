using HeilpraktikerPraxis.Models;
using Microsoft.EntityFrameworkCore;

namespace HeilpraktikerPraxis.Data;

public static class TestdatenSeeder
{
    public static async Task SeedAsync(PraxisDbContext db)
    {
        if (await db.Patienten.AnyAsync()) return;

        var heute = DateTime.Today;
        var heuteOnly = DateOnly.FromDateTime(heute);

        // ── Patienten ──────────────────────────────────────────────────────────
        var patienten = new List<Patient>
        {
            new() {
                PatientNr = "P-2026-001", Anrede = "Frau", Vorname = "Maria", Nachname = "Müller",
                Geburtsdatum = new DateOnly(1980, 3, 14),
                Strasse = "Hauptstraße 12", Plz = "80331", Ort = "München",
                Telefon = "089 123456", Email = "maria.mueller@example.de",
                Versicherungsart = "Privat", Krankenkasse = "DKV",
                Beruf = "Lehrerin",
                Anamnese = "Chronische Rückenschmerzen LWS seit 3 Jahren, Migräne, Stress-bedingte Schlafstörungen.",
                Allergien = "Haselnüsse, Hausstaubmilben",
                Dauermedikamente = "Ibuprofen 400mg bei Bedarf",
                Erstellt = heute.AddMonths(-8)
            },
            new() {
                PatientNr = "P-2026-002", Anrede = "Herr", Vorname = "Thomas", Nachname = "Schneider",
                Geburtsdatum = new DateOnly(1975, 7, 22),
                Strasse = "Gartenweg 5", Plz = "80638", Ort = "München",
                Telefon = "089 654321", Email = "t.schneider@example.de",
                Versicherungsart = "Gesetzlich", Krankenkasse = "AOK Bayern",
                Beruf = "Softwareentwickler",
                Anamnese = "Burnout, Erschöpfungsdepression. Nackenverspannungen durch Bildschirmarbeit. Tinnitus links.",
                Allergien = "keine bekannt",
                Dauermedikamente = "keine",
                Erstellt = heute.AddMonths(-6)
            },
            new() {
                PatientNr = "P-2026-003", Anrede = "Frau", Vorname = "Anna", Nachname = "Weber",
                Geburtsdatum = new DateOnly(1962, 11, 5),
                Strasse = "Birkenallee 23", Plz = "81539", Ort = "München",
                Telefon = "089 987654", Email = "anna.weber@example.de",
                Versicherungsart = "Privat", Krankenkasse = "Allianz Private KV",
                Beruf = "Rentnerin",
                Anamnese = "Arthrose Kniegelenk beidseits, Hypertonie (medikamentös eingestellt), Reflux.",
                Allergien = "Penicillin",
                Dauermedikamente = "Ramipril 5mg, Pantoprazol 20mg",
                Notfallkontakt = "Peter Weber (Ehemann)", Notfalltelefon = "089 987655",
                Erstellt = heute.AddMonths(-12)
            },
            new() {
                PatientNr = "P-2026-004", Anrede = "Herr", Vorname = "Klaus", Nachname = "Fischer",
                Geburtsdatum = new DateOnly(1968, 4, 30),
                Strasse = "Rosenstraße 8", Plz = "80797", Ort = "München",
                Telefon = "0176 44556677", Email = "k.fischer@example.de",
                Versicherungsart = "Gesetzlich", Krankenkasse = "TK",
                Beruf = "Handwerksmeister",
                Anamnese = "Schulter-Arm-Syndrom rechts, chronische Sinusitis, Übergewicht (BMI 29).",
                Allergien = "keine",
                Dauermedikamente = "keine",
                Erstellt = heute.AddMonths(-4)
            },
            new() {
                PatientNr = "P-2026-005", Anrede = "Frau", Vorname = "Sophie", Nachname = "Wagner",
                Geburtsdatum = new DateOnly(1995, 9, 18),
                Strasse = "Lindenweg 3", Plz = "80686", Ort = "München",
                Telefon = "0151 22334455", Email = "sophie.wagner@example.de",
                Versicherungsart = "Privat", Krankenkasse = "Barmenia",
                Beruf = "Grafikdesignerin",
                Anamnese = "Reizdarmsyndrom, Spannungskopfschmerzen, hormonelle Dysbalance.",
                Allergien = "Latex",
                Dauermedikamente = "Pille",
                Erstellt = heute.AddMonths(-2)
            }
        };
        db.Patienten.AddRange(patienten);
        await db.SaveChangesAsync();

        var p1 = patienten[0]; var p2 = patienten[1];
        var p3 = patienten[2]; var p4 = patienten[3]; var p5 = patienten[4];

        // ── Termine ────────────────────────────────────────────────────────────
        var termine = new List<Termin>
        {
            // Vergangene Termine
            new() { PatientId = p1.Id, Datum = heute.AddDays(-60).AddHours(9), DauerMinuten = 60, Art = "Erstanamnese", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-65) },
            new() { PatientId = p1.Id, Datum = heute.AddDays(-45).AddHours(10), DauerMinuten = 45, Art = "Akupunktur", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-50) },
            new() { PatientId = p1.Id, Datum = heute.AddDays(-30).AddHours(10), DauerMinuten = 45, Art = "Akupunktur", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-35) },
            new() { PatientId = p1.Id, Datum = heute.AddDays(-15).AddHours(11), DauerMinuten = 45, Art = "Akupunktur", Status = TerminStatus.Erschienen, Notizen = "Deutliche Besserung der Rückenschmerzen", Erstellt = heute.AddDays(-20) },

            new() { PatientId = p2.Id, Datum = heute.AddDays(-50).AddHours(14), DauerMinuten = 75, Art = "Erstanamnese", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-55) },
            new() { PatientId = p2.Id, Datum = heute.AddDays(-35).AddHours(15), DauerMinuten = 60, Art = "Osteopathie", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-40) },
            new() { PatientId = p2.Id, Datum = heute.AddDays(-20).AddHours(15), DauerMinuten = 60, Art = "Osteopathie", Status = TerminStatus.Abgesagt, Notizen = "Patient krank", Erstellt = heute.AddDays(-25) },

            new() { PatientId = p3.Id, Datum = heute.AddDays(-90).AddHours(9).AddMinutes(30), DauerMinuten = 60, Art = "Erstanamnese", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-95) },
            new() { PatientId = p3.Id, Datum = heute.AddDays(-75).AddHours(10), DauerMinuten = 45, Art = "Physikalische Therapie", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-80) },
            new() { PatientId = p3.Id, Datum = heute.AddDays(-60).AddHours(10), DauerMinuten = 45, Art = "Physikalische Therapie", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-65) },
            new() { PatientId = p3.Id, Datum = heute.AddDays(-45).AddHours(10), DauerMinuten = 45, Art = "Physikalische Therapie", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-50) },

            new() { PatientId = p4.Id, Datum = heute.AddDays(-25).AddHours(16), DauerMinuten = 60, Art = "Erstanamnese", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-30) },
            new() { PatientId = p4.Id, Datum = heute.AddDays(-10).AddHours(16), DauerMinuten = 45, Art = "Infiltration / Injektion", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-15) },

            new() { PatientId = p5.Id, Datum = heute.AddDays(-14).AddHours(11), DauerMinuten = 60, Art = "Erstanamnese", Status = TerminStatus.Erschienen, Erstellt = heute.AddDays(-18) },

            // Zukünftige Termine (heute + kommende Tage)
            new() { PatientId = p1.Id, Datum = heute.AddHours(10), DauerMinuten = 45, Art = "Akupunktur", Status = TerminStatus.Geplant, Erstellt = heute.AddDays(-7) },
            new() { PatientId = p3.Id, Datum = heute.AddHours(14), DauerMinuten = 45, Art = "Physikalische Therapie", Status = TerminStatus.Geplant, Erstellt = heute.AddDays(-5) },
            new() { PatientId = p2.Id, Datum = heute.AddDays(3).AddHours(15), DauerMinuten = 60, Art = "Osteopathie", Status = TerminStatus.Geplant, Erstellt = heute.AddDays(-3) },
            new() { PatientId = p4.Id, Datum = heute.AddDays(5).AddHours(16), DauerMinuten = 45, Art = "Infiltration / Injektion", Status = TerminStatus.Geplant, Erstellt = heute.AddDays(-2) },
            new() { PatientId = p5.Id, Datum = heute.AddDays(7).AddHours(9), DauerMinuten = 60, Art = "Folgebehandlung", Status = TerminStatus.Geplant, Erstellt = heute.AddDays(-1) },
        };
        db.Termine.AddRange(termine);
        await db.SaveChangesAsync();

        // ── Behandlungsdokumentation ───────────────────────────────────────────
        var behandlungen = new List<Behandlung>
        {
            new() {
                PatientId = p1.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-60)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "Chronisches LWS-Syndrom, Spannungskopfschmerzen, Insomnie",
                Therapie = "Ausführliche Anamnese, körperliche Untersuchung, Erstellung Behandlungsplan. Akupunktur nach TCM Blase und Gallenblasenleitbahn.",
                Befund = "Verhärtungen paravertebral LWS beidseits, eingeschränkte Beweglichkeit, Druckschmerz L4/L5.",
                Verlauf = "Erstgespräch. Patientin motiviert und offen für Naturheilkunde.",
                NaechsteSchritte = "Akupunktur 2× pro Monat, Wärme-Eigenbehandlung empfohlen.",
                Erstellt = heute.AddDays(-60), Geaendert = heute.AddDays(-60)
            },
            new() {
                PatientId = p1.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-45)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "LWS-Syndrom, Verbesserung",
                Therapie = "Akupunktur: Bl 23, Bl 40, Gb 34, Ma 36, Di 4. Moxibustion LWS.",
                Befund = "Muskeltonus leicht verbessert. Patientin berichtet von 30% weniger Schmerzen.",
                Verlauf = "Gute Reaktion auf Akupunktur. Schlaf besser.",
                NaechsteSchritte = "Weiterführung Akupunktur, Dehn-Übungen mitgegeben.",
                Erstellt = heute.AddDays(-45), Geaendert = heute.AddDays(-45)
            },
            new() {
                PatientId = p1.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-15)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "LWS-Syndrom, deutliche Remission",
                Therapie = "Akupunktur: Bl 23, Gb 34, Ni 3, Le 3. Schröpftherapie trockenes Schröpfen.",
                Befund = "Signifikante Verbesserung der Symptomatik. Beweglichkeit nahezu normal.",
                Verlauf = "Patientin sehr zufrieden. Kopfschmerzen fast vollständig verschwunden.",
                NaechsteSchritte = "Erhaltungstherapie 1× pro Monat.",
                Erstellt = heute.AddDays(-15), Geaendert = heute.AddDays(-15)
            },

            new() {
                PatientId = p2.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-50)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "Erschöpfungssyndrom, Zervikalsyndrom, Tinnitus links",
                Therapie = "Ausführliche psychosomatische Anamnese. Osteopathische Behandlung HWS, Schädelgelenke.",
                Befund = "Deutliche Blockierung C2/C3 rechts, Hypomobilität Kiefergelenk links, Überarbeitung sichtbar.",
                Verlauf = "Patient sehr erschöpft. Öffnet sich allmählich.",
                NaechsteSchritte = "Osteopathie alle 3 Wochen, Stressmanagement-Empfehlung.",
                Erstellt = heute.AddDays(-50), Geaendert = heute.AddDays(-50)
            },
            new() {
                PatientId = p2.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-35)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "Zervikalsyndrom, Tinnitus",
                Therapie = "Osteopathische Behandlung HWS und Becken. Viszerale Techniken Leber/Gallenblase.",
                Befund = "Mobilität C2/C3 deutlich verbessert. Tinnitus subjektiv leiser laut Patient.",
                Verlauf = "Positive Entwicklung. Schlaf besser, Energie etwas mehr.",
                NaechsteSchritte = "Weiterführung, Atemübungen verschrieben.",
                Erstellt = heute.AddDays(-35), Geaendert = heute.AddDays(-35)
            },

            new() {
                PatientId = p3.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-90)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "Gonarthrose beidseits, Hypertonie, Reflux",
                Therapie = "Anamnese, Befunderhebung. Ultraschall-Gelenk, Bewegungsanalyse. Start physikalische Therapie.",
                Befund = "Crepitation beidseits, Schwellung li. Knie, Bewegungseinschränkung.",
                Verlauf = "Patientin ältlich, aber motiviert. RR 148/92.",
                NaechsteSchritte = "Physikalische Therapie 1× pro Woche, Ernährungsberatung.",
                Erstellt = heute.AddDays(-90), Geaendert = heute.AddDays(-90)
            },

            new() {
                PatientId = p4.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-25)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "Schulter-Arm-Syndrom rechts, Periarthritis humeroscapularis",
                Therapie = "Anamnese, Bewegungstest Schulter, Schmerzanalyse. Infiltrationstherapie vorbereitet.",
                Befund = "Abduktion re. Schulter bis 90° schmerzfrei, darüber starker Schmerz. Muskelansatz-Druckschmerz.",
                Verlauf = "Beruflich stark belastet. Symptome seit 6 Monaten.",
                NaechsteSchritte = "Infiltration Procain 1% + Traumeel. Wärme + Dehnübungen.",
                Erstellt = heute.AddDays(-25), Geaendert = heute.AddDays(-25)
            },

            new() {
                PatientId = p5.Id, Datum = DateOnly.FromDateTime(heute.AddDays(-14)),
                Therapeut = "Heilpraktikerin",
                Diagnose = "Reizdarmsyndrom, Spannungskopfschmerzen, hormonelle Dysbalance",
                Therapie = "Ausführliche Anamnese mit Ernährungsprotokoll-Auswertung. Stuhlmikrobiom-Analyse angeordnet.",
                Befund = "Blähbauch, wechselnder Stuhlgang, Kopfschmerzen zyklisch.",
                Verlauf = "Junge Patientin, unter Druck im Job. Ernährung sehr verarbeitungsreich.",
                NaechsteSchritte = "Mikrobiom-Analyse, Eliminationsdiät, Stressreduktion.",
                Erstellt = heute.AddDays(-14), Geaendert = heute.AddDays(-14)
            },
        };
        db.Behandlungen.AddRange(behandlungen);
        await db.SaveChangesAsync();

        // ── Rechnungen ─────────────────────────────────────────────────────────
        var rechnungen = new List<Rechnung>
        {
            // RE1: Müller – bezahlt
            new() {
                Rechnungsnr = "RE-202604-001", PatientId = p1.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-55),
                Faelligkeitsdatum = heuteOnly.AddDays(-41),
                Zwischensumme = 185.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 185.00m,
                Bezahlt = true, BezahltAm = heute.AddDays(-48), Zahlungsart = "Überweisung",
                Notizen = "Erstanamnese + Akupunktur",
                Erstellt = heute.AddDays(-55),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "A1", Leistung = "Anamnese und Untersuchung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 65.00m },
                    new() { Ziffer = "C1", Leistung = "Akupunktur, erste Sitzung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 80.00m },
                    new() { Ziffer = "A6", Leistung = "Schriftlicher Befundbericht", Einheit = "je Bericht", Anzahl = 1, Einzelpreis = 40.00m },
                }
            },
            // RE2: Müller – bezahlt
            new() {
                Rechnungsnr = "RE-202605-001", PatientId = p1.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-40),
                Faelligkeitsdatum = heuteOnly.AddDays(-26),
                Zwischensumme = 160.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 160.00m,
                Bezahlt = true, BezahltAm = heute.AddDays(-30), Zahlungsart = "EC-Karte",
                Erstellt = heute.AddDays(-40),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "C1", Leistung = "Akupunktur", Einheit = "je Sitzung", Anzahl = 2, Einzelpreis = 70.00m },
                    new() { Ziffer = "D3", Leistung = "Moxibustion", Einheit = "je Sitzung", Anzahl = 2, Einzelpreis = 10.00m },
                }
            },
            // RE3: Müller – offen
            new() {
                Rechnungsnr = "RE-202606-001", PatientId = p1.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-10),
                Faelligkeitsdatum = heuteOnly.AddDays(4),
                Zwischensumme = 95.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 95.00m,
                Bezahlt = false,
                Erstellt = heute.AddDays(-10),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "C1", Leistung = "Akupunktur", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 70.00m },
                    new() { Ziffer = "E4", Leistung = "Schröpftherapie (trocken)", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 25.00m },
                }
            },

            // RE4: Schneider – bezahlt
            new() {
                Rechnungsnr = "RE-202605-002", PatientId = p2.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-45),
                Faelligkeitsdatum = heuteOnly.AddDays(-31),
                Zwischensumme = 230.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 230.00m,
                Bezahlt = true, BezahltAm = heute.AddDays(-38), Zahlungsart = "Überweisung",
                Erstellt = heute.AddDays(-45),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "A1", Leistung = "Anamnese und Untersuchung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 65.00m },
                    new() { Ziffer = "F1", Leistung = "Osteopathische Behandlung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 120.00m },
                    new() { Ziffer = "A5", Leistung = "Beratung, eingehend", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 45.00m },
                }
            },
            // RE5: Schneider – offen
            new() {
                Rechnungsnr = "RE-202606-002", PatientId = p2.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-30),
                Faelligkeitsdatum = heuteOnly.AddDays(-16),
                Zwischensumme = 120.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 120.00m,
                Bezahlt = false,
                Notizen = "Zahlung per Überweisung ausstehend",
                Erstellt = heute.AddDays(-30),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "F1", Leistung = "Osteopathische Behandlung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 120.00m },
                }
            },

            // RE6: Weber – bezahlt
            new() {
                Rechnungsnr = "RE-202603-001", PatientId = p3.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-85),
                Faelligkeitsdatum = heuteOnly.AddDays(-71),
                Zwischensumme = 200.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 200.00m,
                Bezahlt = true, BezahltAm = heute.AddDays(-78), Zahlungsart = "Überweisung",
                Erstellt = heute.AddDays(-85),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "A1", Leistung = "Anamnese und Untersuchung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 65.00m },
                    new() { Ziffer = "D1", Leistung = "Krankengymnastik / Bewegungstherapie", Einheit = "je Sitzung", Anzahl = 3, Einzelpreis = 45.00m },
                }
            },
            // RE7: Weber – bezahlt
            new() {
                Rechnungsnr = "RE-202604-002", PatientId = p3.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-55),
                Faelligkeitsdatum = heuteOnly.AddDays(-41),
                Zwischensumme = 135.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 135.00m,
                Bezahlt = true, BezahltAm = heute.AddDays(-49), Zahlungsart = "Bar",
                Erstellt = heute.AddDays(-55),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "D1", Leistung = "Krankengymnastik / Bewegungstherapie", Einheit = "je Sitzung", Anzahl = 3, Einzelpreis = 45.00m },
                }
            },

            // RE8: Fischer – offen (überfällig)
            new() {
                Rechnungsnr = "RE-202606-003", PatientId = p4.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-20),
                Faelligkeitsdatum = heuteOnly.AddDays(-6),
                Zwischensumme = 175.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 175.00m,
                Bezahlt = false,
                Erstellt = heute.AddDays(-20),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "A1", Leistung = "Anamnese und Untersuchung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 65.00m },
                    new() { Ziffer = "B1", Leistung = "Injektion, intramuskulär", Einheit = "je Injektion", Anzahl = 2, Einzelpreis = 15.00m },
                    new() { Ziffer = "B3", Leistung = "Infiltration / Lokalanästhesie", Einheit = "je Infiltration", Anzahl = 2, Einzelpreis = 40.00m },
                }
            },

            // RE9: Wagner – offen
            new() {
                Rechnungsnr = "RE-202606-004", PatientId = p5.Id,
                Ausstellungsdatum = heuteOnly.AddDays(-12),
                Faelligkeitsdatum = heuteOnly.AddDays(2),
                Zwischensumme = 105.00m, MwstSatz = 0, MwstBetrag = 0, Gesamtbetrag = 105.00m,
                Bezahlt = false,
                Erstellt = heute.AddDays(-12),
                Positionen = new List<RechnungsPosition>
                {
                    new() { Ziffer = "A1", Leistung = "Anamnese und Untersuchung", Einheit = "je Sitzung", Anzahl = 1, Einzelpreis = 65.00m },
                    new() { Ziffer = "G1", Leistung = "Labordiagnostik, Basisprofil", Einheit = "je Analyse", Anzahl = 1, Einzelpreis = 40.00m },
                }
            },
        };
        db.Rechnungen.AddRange(rechnungen);
        await db.SaveChangesAsync();
    }
}
