import type { GebueHPosition } from '../types';

// Gebührenverzeichnis für Heilpraktiker (GebüH) – Auszug der häufigsten Positionen
export const GEBUEH_POSITIONEN: GebueHPosition[] = [
  // A – Allgemeine Leistungen
  { ziffer: 'A 1', leistung: 'Eingehende Anamnese, Untersuchung und Beratung (Neu- und Erstpatienten)', einheit: 'je Behandlung', preis: 25.00, kategorie: 'A – Allgemeine Leistungen' },
  { ziffer: 'A 2', leistung: 'Eingehende Anamnese, Untersuchung und Beratung (Folgepatienten)', einheit: 'je Behandlung', preis: 15.00, kategorie: 'A – Allgemeine Leistungen' },
  { ziffer: 'A 3', leistung: 'Kurze Beratung', einheit: 'je Behandlung', preis: 7.00, kategorie: 'A – Allgemeine Leistungen' },
  { ziffer: 'A 4', leistung: 'Hausbesuch', einheit: 'je Besuch', preis: 20.00, kategorie: 'A – Allgemeine Leistungen' },
  { ziffer: 'A 5', leistung: 'Telefonische Beratung (je angefangene 10 Minuten)', einheit: 'je 10 Min.', preis: 8.00, kategorie: 'A – Allgemeine Leistungen' },
  { ziffer: 'A 6', leistung: 'Schriftlicher Bericht / Attest', einheit: 'je Dokument', preis: 12.00, kategorie: 'A – Allgemeine Leistungen' },
  { ziffer: 'A 7', leistung: 'Wegegeld (bis 2 km)', einheit: 'je Besuch', preis: 5.00, kategorie: 'A – Allgemeine Leistungen' },
  { ziffer: 'A 8', leistung: 'Wegegeld (2–5 km)', einheit: 'je Besuch', preis: 8.00, kategorie: 'A – Allgemeine Leistungen' },

  // B – Injektionen und Infusionen
  { ziffer: 'B 1', leistung: 'Injektion subkutan / intramuskulär', einheit: 'je Injektion', preis: 6.00, kategorie: 'B – Injektionen und Infusionen' },
  { ziffer: 'B 2', leistung: 'Injektion intravenös', einheit: 'je Injektion', preis: 9.00, kategorie: 'B – Injektionen und Infusionen' },
  { ziffer: 'B 3', leistung: 'Eigenblutinjektion', einheit: 'je Behandlung', preis: 15.00, kategorie: 'B – Injektionen und Infusionen' },
  { ziffer: 'B 4', leistung: 'Infusion (bis 30 Minuten)', einheit: 'je Infusion', preis: 18.00, kategorie: 'B – Injektionen und Infusionen' },
  { ziffer: 'B 5', leistung: 'Infusion (über 30 Minuten)', einheit: 'je Infusion', preis: 25.00, kategorie: 'B – Injektionen und Infusionen' },

  // C – Akupunktur
  { ziffer: 'C 1', leistung: 'Körperakupunktur (je Sitzung)', einheit: 'je Sitzung', preis: 35.00, kategorie: 'C – Akupunktur' },
  { ziffer: 'C 2', leistung: 'Ohrakupunktur', einheit: 'je Sitzung', preis: 25.00, kategorie: 'C – Akupunktur' },
  { ziffer: 'C 3', leistung: 'Moxibustion', einheit: 'je Sitzung', preis: 15.00, kategorie: 'C – Akupunktur' },
  { ziffer: 'C 4', leistung: 'Schädelakupunktur nach Yamamoto (YNSA)', einheit: 'je Sitzung', preis: 40.00, kategorie: 'C – Akupunktur' },

  // D – Physikalische Therapie
  { ziffer: 'D 1', leistung: 'Massage (Klassische Massage, 20 Min.)', einheit: 'je Behandlung', preis: 20.00, kategorie: 'D – Physikalische Therapie' },
  { ziffer: 'D 2', leistung: 'Massage (30 Min.)', einheit: 'je Behandlung', preis: 28.00, kategorie: 'D – Physikalische Therapie' },
  { ziffer: 'D 3', leistung: 'Wärmetherapie / Fango', einheit: 'je Behandlung', preis: 12.00, kategorie: 'D – Physikalische Therapie' },
  { ziffer: 'D 4', leistung: 'Elektrotherapie (Tens, Ultraschall)', einheit: 'je Behandlung', preis: 15.00, kategorie: 'D – Physikalische Therapie' },
  { ziffer: 'D 5', leistung: 'Lymphdrainage (30 Min.)', einheit: 'je Behandlung', preis: 35.00, kategorie: 'D – Physikalische Therapie' },

  // E – Naturheilkundliche Therapien
  { ziffer: 'E 1', leistung: 'Homöopathische Behandlung (Erst- und Folgekonsultation)', einheit: 'je Sitzung', preis: 40.00, kategorie: 'E – Naturheilkundliche Therapien' },
  { ziffer: 'E 2', leistung: 'Schröpfen (blutig)', einheit: 'je Behandlung', preis: 20.00, kategorie: 'E – Naturheilkundliche Therapien' },
  { ziffer: 'E 3', leistung: 'Schröpfen (trocken)', einheit: 'je Behandlung', preis: 12.00, kategorie: 'E – Naturheilkundliche Therapien' },
  { ziffer: 'E 4', leistung: 'Blutegel-Therapie', einheit: 'je Behandlung', preis: 55.00, kategorie: 'E – Naturheilkundliche Therapien' },
  { ziffer: 'E 5', leistung: 'Neuraltherapie', einheit: 'je Sitzung', preis: 30.00, kategorie: 'E – Naturheilkundliche Therapien' },
  { ziffer: 'E 6', leistung: 'Bioresonanztherapie', einheit: 'je Sitzung', preis: 50.00, kategorie: 'E – Naturheilkundliche Therapien' },
  { ziffer: 'E 7', leistung: 'Kinesiologie', einheit: 'je Sitzung', preis: 45.00, kategorie: 'E – Naturheilkundliche Therapien' },

  // F – Osteopathie / Manuelle Therapie
  { ziffer: 'F 1', leistung: 'Osteopathische Behandlung (45 Min.)', einheit: 'je Sitzung', preis: 75.00, kategorie: 'F – Osteopathie / Manuelle Therapie' },
  { ziffer: 'F 2', leistung: 'Chiropraktik', einheit: 'je Sitzung', preis: 40.00, kategorie: 'F – Osteopathie / Manuelle Therapie' },
  { ziffer: 'F 3', leistung: 'Craniosacrale Therapie', einheit: 'je Sitzung', preis: 65.00, kategorie: 'F – Osteopathie / Manuelle Therapie' },

  // G – Labordiagnostik
  { ziffer: 'G 1', leistung: 'Blutentnahme', einheit: 'je Entnahme', preis: 5.00, kategorie: 'G – Labordiagnostik' },
  { ziffer: 'G 2', leistung: 'Urinuntersuchung (Teststreifen)', einheit: 'je Untersuchung', preis: 4.00, kategorie: 'G – Labordiagnostik' },
  { ziffer: 'G 3', leistung: 'Blutdruckmessung', einheit: 'je Messung', preis: 3.00, kategorie: 'G – Labordiagnostik' },
  { ziffer: 'G 4', leistung: 'EKG', einheit: 'je Untersuchung', preis: 15.00, kategorie: 'G – Labordiagnostik' },
  { ziffer: 'G 5', leistung: 'Blutzuckermessung', einheit: 'je Messung', preis: 4.00, kategorie: 'G – Labordiagnostik' },

  // H – Psychotherapeutische Leistungen
  { ziffer: 'H 1', leistung: 'Psychotherapeutisches Gespräch (50 Min.)', einheit: 'je Sitzung', preis: 80.00, kategorie: 'H – Psychotherapeutische Leistungen' },
  { ziffer: 'H 2', leistung: 'Hypnose / Hypnotherapie', einheit: 'je Sitzung', preis: 70.00, kategorie: 'H – Psychotherapeutische Leistungen' },
  { ziffer: 'H 3', leistung: 'EMDR', einheit: 'je Sitzung', preis: 85.00, kategorie: 'H – Psychotherapeutische Leistungen' },
];

export function getKategorien(): string[] {
  return [...new Set(GEBUEH_POSITIONEN.map(p => p.kategorie))];
}

export function getPositionenByKategorie(kategorie: string): GebueHPosition[] {
  return GEBUEH_POSITIONEN.filter(p => p.kategorie === kategorie);
}
