export interface Patient {
  id?: number;
  patientNr: string;
  anrede: 'Herr' | 'Frau' | 'Divers' | '';
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  versicherungsart: 'GKV' | 'PKV' | 'Selbstzahler';
  krankenkasse?: string;
  versicherungsnr?: string;
  beruf?: string;
  notfallkontakt?: string;
  notfalltelefon?: string;
  anamnese?: string;
  allergien?: string;
  dauermedikamente?: string;
  erstellt: string;
  aktiv: boolean;
}

export interface Termin {
  id?: number;
  patientId: number;
  patientName?: string;
  datum: string;
  uhrzeit: string;
  dauer: number; // Minuten
  art: string;
  notizen?: string;
  status: 'geplant' | 'erschienen' | 'abgesagt' | 'nicht_erschienen';
  erinnerungGesendet?: boolean;
  erstellt: string;
}

export interface GebueHPosition {
  ziffer: string;
  leistung: string;
  einheit: string;
  preis: number; // empfohlener Preis in Euro
  kategorie: string;
}

export interface RechnungsPosition {
  id?: number;
  ziffer: string;
  leistung: string;
  einheit: string;
  anzahl: number;
  einzelpreis: number;
  gesamtpreis: number;
}

export interface Rechnung {
  id?: number;
  rechnungsnr: string;
  patientId: number;
  patientName?: string;
  ausstellungsdatum: string;
  faelligkeitsdatum: string;
  positionen: RechnungsPosition[];
  zwischensumme: number;
  mwstSatz: number; // Heilpraktiker: 0% (umsatzsteuerbefreit)
  mwstBetrag: number;
  gesamtbetrag: number;
  bezahlt: boolean;
  bezahltAm?: string;
  zahlungsart?: 'Bar' | 'Überweisung' | 'EC-Karte';
  notizen?: string;
  erstellt: string;
  // Praxis-Daten zum Zeitpunkt der Erstellung
  praximDaten: PraxisDaten;
}

export interface Behandlung {
  id?: number;
  patientId: number;
  terminId?: number;
  datum: string;
  therapeut: string;
  diagnose: string;
  therapie: string;
  befund: string;
  verlauf: string;
  naechsteSchritte?: string;
  medikamente?: string;
  erstellt: string;
  geaendert: string;
}

export interface Dokument {
  id?: number;
  patientId?: number;
  name: string;
  typ: string;
  kategorie: 'Befund' | 'Rezept' | 'Brief' | 'Einwilligung' | 'Sonstiges';
  beschreibung?: string;
  daten: string; // Base64
  groesse: number;
  erstellt: string;
}

export interface PraxisDaten {
  name: string;
  inhaberin: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  webseite?: string;
  steuernr?: string;
  ustIdNr?: string;
  iban?: string;
  bic?: string;
  bank?: string;
  logo?: string;
  heilpraktikerErlaubnis?: string;
}

export interface PortalZugang {
  id?: number;
  patientId: number;
  pinHash: string;
  aktiv: boolean;
  erstellt: string;
  letzterLogin?: string;
  einwilligungDsgvo: boolean;
  einwilligungDsgvoDatum?: string;
}

export interface PortalDokument {
  id?: number;
  patientId: number;
  name: string;
  typ: string;
  kategorie: 'Anamnesebogen' | 'Befund' | 'Bild' | 'Labor' | 'Sonstiges';
  hochgeladenVon: 'patient' | 'praxis';
  beschreibung?: string;
  daten: string;
  groesse: number;
  erstellt: string;
}

export interface PortalSession {
  patientId: number;
  patientNr: string;
  vorname: string;
  nachname: string;
}
