import Dexie, { type EntityTable } from 'dexie';
import type { Patient, Termin, Rechnung, Behandlung, Dokument, PraxisDaten } from '../types';

interface PraxisSettings {
  id: number;
  daten: PraxisDaten;
}

class PraxisDB extends Dexie {
  patienten!: EntityTable<Patient, 'id'>;
  termine!: EntityTable<Termin, 'id'>;
  rechnungen!: EntityTable<Rechnung, 'id'>;
  behandlungen!: EntityTable<Behandlung, 'id'>;
  dokumente!: EntityTable<Dokument, 'id'>;
  einstellungen!: EntityTable<PraxisSettings, 'id'>;

  constructor() {
    super('HeilpraktikerPraxis');
    this.version(1).stores({
      patienten: '++id, nachname, vorname, patientNr, aktiv',
      termine: '++id, patientId, datum, status',
      rechnungen: '++id, patientId, rechnungsnr, ausstellungsdatum, bezahlt',
      behandlungen: '++id, patientId, datum, terminId',
      dokumente: '++id, patientId, kategorie, erstellt',
      einstellungen: '++id',
    });
  }
}

export const db = new PraxisDB();

// Standarddaten beim ersten Start
export async function initDB() {
  const count = await db.patienten.count();
  if (count === 0) {
    const settings = await db.einstellungen.count();
    if (settings === 0) {
      await db.einstellungen.add({
        id: 1,
        daten: {
          name: 'Naturheilpraxis',
          inhaberin: 'Maria Serrano',
          strasse: 'Musterstraße 1',
          plz: '12345',
          ort: 'Musterstadt',
          telefon: '0123 456789',
          email: 'praxis@example.de',
          webseite: 'www.praxis.de',
          steuernr: '123/456/78901',
          iban: 'DE00 1234 5678 9012 3456 78',
          bic: 'XXXXXXXXXXX',
          bank: 'Musterbank',
          heilpraktikerErlaubnis: 'gem. § 1 HeilprG',
        },
      });
    }
  }
}

export async function getPraxisDaten(): Promise<PraxisDaten> {
  const settings = await db.einstellungen.get(1);
  return settings?.daten ?? {
    name: 'Naturheilpraxis',
    inhaberin: '',
    strasse: '',
    plz: '',
    ort: '',
    telefon: '',
    email: '',
  };
}

export async function savePraxisDaten(daten: PraxisDaten) {
  const existing = await db.einstellungen.get(1);
  if (existing) {
    await db.einstellungen.update(1, { daten });
  } else {
    await db.einstellungen.add({ id: 1, daten });
  }
}

export function generatePatientNr(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2);
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `P${year}-${random}`;
}

export function generateRechnungsNr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 900) + 100;
  return `RE-${year}${month}-${random}`;
}
