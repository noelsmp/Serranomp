export type PatientStatus = 'aktiv' | 'gesperrt'
export type Rolle = 'patient' | 'admin'
export type RegistrierungStatus = 'ausstehend' | 'freigeschaltet' | 'abgelehnt'
export type DokumentKategorie = 'rechnung' | 'anamnesebogen' | 'behandlung' | 'vorlage' | 'sonstiges'
export type HochgeladenVon = 'praxis' | 'patient'

export interface PatientProfil {
  id: string
  vorname: string
  nachname: string
  email: string
  geburtsdatum: string | null
  telefon: string | null
  praxis_patient_nr: string | null
  status: PatientStatus
  rolle: Rolle
  erstellt: string
}

export interface Registrierung {
  id: string
  vorname: string
  nachname: string
  email: string
  geburtsdatum: string
  telefon: string
  datenschutz_zugestimmt: boolean
  nutzungsbedingungen_zugestimmt: boolean
  status: RegistrierungStatus
  erstellt: string
  bearbeitet_am: string | null
  bearbeitet_von: string | null
}

export interface Dokument {
  id: string
  patient_id: string
  name: string
  kategorie: DokumentKategorie
  storage_path: string
  dateigroesse: number
  mime_type: string
  hochgeladen_von: HochgeladenVon
  hochgeladen_von_name: string | null
  erstellt: string
}

export interface Rechnung {
  id: string
  patient_id: string
  rechnungsnr: string
  ausstellungsdatum: string
  faelligkeitsdatum: string
  gesamtbetrag: number
  bezahlt: boolean
  bezahlt_am: string | null
  pdf_storage_path: string | null
  erstellt: string
}

export interface AuditLogEintrag {
  id: string
  user_id: string | null
  aktion: string
  details: Record<string, unknown> | null
  ip_adresse: string | null
  erstellt: string
}

export interface DsgvoAnfrage {
  id: string
  patient_id: string
  email: string
  typ: 'auskunft' | 'loeschung' | 'export'
  nachricht: string | null
  bearbeitet: boolean
  erstellt: string
}

export const KATEGORIE_LABELS: Record<DokumentKategorie, string> = {
  rechnung: 'Rechnung',
  anamnesebogen: 'Anamnesebogen',
  behandlung: 'Behandlungsdokumentation',
  vorlage: 'Vorlage',
  sonstiges: 'Sonstiges',
}

export const KATEGORIE_FARBEN: Record<DokumentKategorie, string> = {
  rechnung: 'bg-amber-50 text-amber-800 border-amber-200',
  anamnesebogen: 'bg-blue-50 text-blue-800 border-blue-200',
  behandlung: 'bg-green-50 text-green-800 border-green-200',
  vorlage: 'bg-purple-50 text-purple-800 border-purple-200',
  sonstiges: 'bg-stone-50 text-stone-700 border-stone-200',
}

export function formatDateigroesse(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDatum(isoString: string): string {
  return new Date(isoString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDatumZeit(isoString: string): string {
  return new Date(isoString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
