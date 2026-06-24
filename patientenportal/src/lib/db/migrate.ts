import { client } from './index'

const TABELLEN = [
  `CREATE TABLE IF NOT EXISTS benutzer (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    passwort_hash TEXT NOT NULL,
    vorname TEXT NOT NULL,
    nachname TEXT NOT NULL,
    geburtsdatum TEXT,
    telefon TEXT,
    rolle TEXT NOT NULL DEFAULT 'patient' CHECK (rolle IN ('patient','admin')),
    status TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','gesperrt')),
    praxis_patient_nr TEXT,
    erstellt TEXT NOT NULL DEFAULT (datetime('now')),
    letzter_login TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS registrierungen (
    id TEXT PRIMARY KEY,
    vorname TEXT NOT NULL,
    nachname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    geburtsdatum TEXT NOT NULL,
    telefon TEXT NOT NULL,
    datenschutz_zugestimmt INTEGER NOT NULL DEFAULT 0,
    nutzungsbedingungen_zugestimmt INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ausstehend' CHECK (status IN ('ausstehend','freigeschaltet','abgelehnt')),
    erstellt TEXT NOT NULL DEFAULT (datetime('now')),
    bearbeitet_am TEXT,
    bearbeitet_von TEXT,
    token TEXT NOT NULL UNIQUE
  )`,
  `CREATE TABLE IF NOT EXISTS dokumente (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES benutzer(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kategorie TEXT NOT NULL CHECK (kategorie IN ('rechnung','anamnesebogen','behandlung','vorlage','sonstiges')),
    dateipfad TEXT NOT NULL,
    dateigroesse INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    hochgeladen_von TEXT NOT NULL CHECK (hochgeladen_von IN ('praxis','patient')),
    hochgeladen_von_name TEXT,
    erstellt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS rechnungen (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES benutzer(id) ON DELETE CASCADE,
    rechnungsnr TEXT NOT NULL,
    ausstellungsdatum TEXT NOT NULL,
    faelligkeitsdatum TEXT NOT NULL,
    gesamtbetrag REAL NOT NULL,
    bezahlt INTEGER NOT NULL DEFAULT 0,
    bezahlt_am TEXT,
    dokument_id TEXT REFERENCES dokumente(id),
    erstellt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    aktion TEXT NOT NULL,
    details TEXT,
    ip_adresse TEXT,
    erstellt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS dsgvo_anfragen (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES benutzer(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    typ TEXT NOT NULL CHECK (typ IN ('auskunft','loeschung','export')),
    nachricht TEXT,
    bearbeitet INTEGER NOT NULL DEFAULT 0,
    erstellt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES benutzer(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    ablauf TEXT NOT NULL,
    erstellt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS passwort_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES benutzer(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    ablauf TEXT NOT NULL,
    erstellt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_dokumente_patient ON dokumente(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_rechnungen_patient ON rechnungen(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_registrierungen_status ON registrierungen(status)`,
  `CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON passwort_reset_tokens(token)`,
  `PRAGMA journal_mode = WAL`,
  `PRAGMA foreign_keys = ON`,
]

export async function migrate() {
  for (const sql of TABELLEN) {
    await client.execute(sql)
  }
}

migrate().then(() => console.log('Migration abgeschlossen.')).catch(console.error)
