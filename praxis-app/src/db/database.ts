import Dexie, { type EntityTable } from 'dexie';
import type {
  Patient, Termin, Rechnung, Behandlung, Dokument, PraxisDaten,
  PortalZugang, PortalDokument,
} from '../types';

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
  portalZugaenge!: EntityTable<PortalZugang, 'id'>;
  portalDokumente!: EntityTable<PortalDokument, 'id'>;

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
    this.version(2).stores({
      patienten: '++id, nachname, vorname, patientNr, aktiv',
      termine: '++id, patientId, datum, status',
      rechnungen: '++id, patientId, rechnungsnr, ausstellungsdatum, bezahlt',
      behandlungen: '++id, patientId, datum, terminId',
      dokumente: '++id, patientId, kategorie, erstellt',
      einstellungen: '++id',
      portalZugaenge: '++id, patientId',
      portalDokumente: '++id, patientId, kategorie, hochgeladenVon, erstellt',
    });
  }
}

export const db = new PraxisDB();

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

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`hp-portal-2024:${pin}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOrUpdatePortalZugang(patientId: number, pin: string): Promise<void> {
  const pinHash = await hashPin(pin);
  const existing = await db.portalZugaenge.where('patientId').equals(patientId).first();
  if (existing) {
    await db.portalZugaenge.update(existing.id!, { pinHash, aktiv: true });
  } else {
    await db.portalZugaenge.add({
      patientId,
      pinHash,
      aktiv: true,
      erstellt: new Date().toISOString(),
      einwilligungDsgvo: false,
    });
  }
}

export async function deactivatePortalZugang(patientId: number): Promise<void> {
  const existing = await db.portalZugaenge.where('patientId').equals(patientId).first();
  if (existing) {
    await db.portalZugaenge.update(existing.id!, { aktiv: false });
  }
}

export async function getPortalZugang(patientId: number): Promise<PortalZugang | undefined> {
  return db.portalZugaenge.where('patientId').equals(patientId).first();
}

export function downloadBlob(data: string, mimeType: string, filename: string): void {
  const byteChars = atob(data);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
