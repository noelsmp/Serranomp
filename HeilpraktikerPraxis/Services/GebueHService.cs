namespace HeilpraktikerPraxis.Services;

public record GebueHPosition(string Ziffer, string Leistung, string Einheit, decimal Preis, string Kategorie);

public class GebueHService
{
    public static readonly List<GebueHPosition> Positionen =
    [
        // A – Allgemeine Leistungen
        new("A 1", "Eingehende Anamnese, Untersuchung und Beratung (Erstpatient)", "je Behandlung", 25.00m, "A – Allgemeine Leistungen"),
        new("A 2", "Eingehende Anamnese, Untersuchung und Beratung (Folgepatient)", "je Behandlung", 15.00m, "A – Allgemeine Leistungen"),
        new("A 3", "Kurze Beratung / Kurzgespräch", "je Behandlung", 7.00m, "A – Allgemeine Leistungen"),
        new("A 4", "Hausbesuch", "je Besuch", 20.00m, "A – Allgemeine Leistungen"),
        new("A 5", "Telefonische Beratung (je angefangene 10 Min.)", "je 10 Min.", 8.00m, "A – Allgemeine Leistungen"),
        new("A 6", "Schriftlicher Bericht / Attest / Zeugnis", "je Dokument", 12.00m, "A – Allgemeine Leistungen"),
        new("A 7", "Wegegeld bis 2 km", "je Besuch", 5.00m, "A – Allgemeine Leistungen"),
        new("A 8", "Wegegeld 2–5 km", "je Besuch", 8.00m, "A – Allgemeine Leistungen"),

        // B – Injektionen und Infusionen
        new("B 1", "Injektion subkutan / intramuskulär", "je Injektion", 6.00m, "B – Injektionen und Infusionen"),
        new("B 2", "Injektion intravenös", "je Injektion", 9.00m, "B – Injektionen und Infusionen"),
        new("B 3", "Eigenblutinjektion", "je Behandlung", 15.00m, "B – Injektionen und Infusionen"),
        new("B 4", "Infusion bis 30 Minuten", "je Infusion", 18.00m, "B – Injektionen und Infusionen"),
        new("B 5", "Infusion über 30 Minuten", "je Infusion", 25.00m, "B – Injektionen und Infusionen"),

        // C – Akupunktur
        new("C 1", "Körperakupunktur (je Sitzung)", "je Sitzung", 35.00m, "C – Akupunktur"),
        new("C 2", "Ohrakupunktur", "je Sitzung", 25.00m, "C – Akupunktur"),
        new("C 3", "Moxibustion", "je Sitzung", 15.00m, "C – Akupunktur"),
        new("C 4", "Schädelakupunktur nach Yamamoto (YNSA)", "je Sitzung", 40.00m, "C – Akupunktur"),

        // D – Physikalische Therapie
        new("D 1", "Klassische Massage (20 Min.)", "je Behandlung", 20.00m, "D – Physikalische Therapie"),
        new("D 2", "Klassische Massage (30 Min.)", "je Behandlung", 28.00m, "D – Physikalische Therapie"),
        new("D 3", "Wärmetherapie / Fango", "je Behandlung", 12.00m, "D – Physikalische Therapie"),
        new("D 4", "Elektrotherapie (TENS, Ultraschall)", "je Behandlung", 15.00m, "D – Physikalische Therapie"),
        new("D 5", "Lymphdrainage (30 Min.)", "je Behandlung", 35.00m, "D – Physikalische Therapie"),
        new("D 6", "Lymphdrainage (45 Min.)", "je Behandlung", 48.00m, "D – Physikalische Therapie"),

        // E – Naturheilkundliche Therapien
        new("E 1", "Homöopathische Behandlung", "je Sitzung", 40.00m, "E – Naturheilkundliche Therapien"),
        new("E 2", "Schröpfen (blutig)", "je Behandlung", 20.00m, "E – Naturheilkundliche Therapien"),
        new("E 3", "Schröpfen (trocken)", "je Behandlung", 12.00m, "E – Naturheilkundliche Therapien"),
        new("E 4", "Blutegel-Therapie", "je Behandlung", 55.00m, "E – Naturheilkundliche Therapien"),
        new("E 5", "Neuraltherapie", "je Sitzung", 30.00m, "E – Naturheilkundliche Therapien"),
        new("E 6", "Bioresonanztherapie", "je Sitzung", 50.00m, "E – Naturheilkundliche Therapien"),
        new("E 7", "Kinesiologie", "je Sitzung", 45.00m, "E – Naturheilkundliche Therapien"),
        new("E 8", "Baunscheidt-Therapie", "je Behandlung", 22.00m, "E – Naturheilkundliche Therapien"),

        // F – Osteopathie / Manuelle Therapie
        new("F 1", "Osteopathische Behandlung (45 Min.)", "je Sitzung", 75.00m, "F – Osteopathie / Manuelle Therapie"),
        new("F 2", "Chiropraktik / Chirotherapie", "je Sitzung", 40.00m, "F – Osteopathie / Manuelle Therapie"),
        new("F 3", "Craniosacrale Therapie", "je Sitzung", 65.00m, "F – Osteopathie / Manuelle Therapie"),
        new("F 4", "Faszientherapie", "je Sitzung", 55.00m, "F – Osteopathie / Manuelle Therapie"),

        // G – Labordiagnostik
        new("G 1", "Blutentnahme venös", "je Entnahme", 5.00m, "G – Labordiagnostik"),
        new("G 2", "Urinuntersuchung (Teststreifen)", "je Untersuchung", 4.00m, "G – Labordiagnostik"),
        new("G 3", "Blutdruckmessung", "je Messung", 3.00m, "G – Labordiagnostik"),
        new("G 4", "EKG (Ruhe)", "je Untersuchung", 15.00m, "G – Labordiagnostik"),
        new("G 5", "Blutzuckermessung", "je Messung", 4.00m, "G – Labordiagnostik"),
        new("G 6", "Dunkelfeldmikroskopie", "je Untersuchung", 25.00m, "G – Labordiagnostik"),

        // H – Psychotherapeutische Leistungen
        new("H 1", "Psychotherapeutisches Gespräch (50 Min.)", "je Sitzung", 80.00m, "H – Psychotherapeutische Leistungen"),
        new("H 2", "Hypnose / Hypnotherapie", "je Sitzung", 70.00m, "H – Psychotherapeutische Leistungen"),
        new("H 3", "EMDR", "je Sitzung", 85.00m, "H – Psychotherapeutische Leistungen"),
        new("H 4", "Entspannungstherapie (PMR, Autogenes Training)", "je Sitzung", 35.00m, "H – Psychotherapeutische Leistungen"),
    ];

    public static IEnumerable<string> Kategorien => Positionen.Select(p => p.Kategorie).Distinct();

    public static IEnumerable<GebueHPosition> NachKategorie(string kategorie) =>
        Positionen.Where(p => p.Kategorie == kategorie);
}
