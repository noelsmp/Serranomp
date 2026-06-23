import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ─── Benutzer (Patienten + Admin) ─────────────────────────────────────────────
export const benutzer = sqliteTable('benutzer', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwortHash: text('passwort_hash').notNull(),
  vorname: text('vorname').notNull(),
  nachname: text('nachname').notNull(),
  geburtsdatum: text('geburtsdatum'),
  telefon: text('telefon'),
  rolle: text('rolle', { enum: ['patient', 'admin'] }).notNull().default('patient'),
  status: text('status', { enum: ['aktiv', 'gesperrt'] }).notNull().default('aktiv'),
  praxisPatientNr: text('praxis_patient_nr'),
  erstellt: text('erstellt').notNull().default(sql`(datetime('now'))`),
  letzterLogin: text('letzter_login'),
})

// ─── Registrierungsanfragen (vor Admin-Freischaltung) ─────────────────────────
export const registrierungen = sqliteTable('registrierungen', {
  id: text('id').primaryKey(),
  vorname: text('vorname').notNull(),
  nachname: text('nachname').notNull(),
  email: text('email').notNull().unique(),
  geburtsdatum: text('geburtsdatum').notNull(),
  telefon: text('telefon').notNull(),
  datenschutzZugestimmt: integer('datenschutz_zugestimmt', { mode: 'boolean' }).notNull().default(false),
  nutzungsbedingungenZugestimmt: integer('nutzungsbedingungen_zugestimmt', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['ausstehend', 'freigeschaltet', 'abgelehnt'] }).notNull().default('ausstehend'),
  erstellt: text('erstellt').notNull().default(sql`(datetime('now'))`),
  bearbeitetAm: text('bearbeitet_am'),
  bearbeitetVon: text('bearbeitet_von'),
  token: text('token').notNull(),  // für E-Mail-Links
})

// ─── Dokumente ────────────────────────────────────────────────────────────────
export const dokumente = sqliteTable('dokumente', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => benutzer.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  kategorie: text('kategorie', {
    enum: ['rechnung', 'anamnesebogen', 'behandlung', 'vorlage', 'sonstiges'],
  }).notNull(),
  dateipfad: text('dateipfad').notNull(),   // relativer Pfad im uploads-Verzeichnis
  dateigroesse: integer('dateigroesse').notNull().default(0),
  mimeType: text('mime_type').notNull().default('application/octet-stream'),
  hochgeladenVon: text('hochgeladen_von', { enum: ['praxis', 'patient'] }).notNull(),
  hochgeladenVonName: text('hochgeladen_von_name'),
  erstellt: text('erstellt').notNull().default(sql`(datetime('now'))`),
})

// ─── Rechnungen ───────────────────────────────────────────────────────────────
export const rechnungen = sqliteTable('rechnungen', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => benutzer.id, { onDelete: 'cascade' }),
  rechnungsnr: text('rechnungsnr').notNull(),
  ausstellungsdatum: text('ausstellungsdatum').notNull(),
  faelligkeitsdatum: text('faelligkeitsdatum').notNull(),
  gesamtbetrag: real('gesamtbetrag').notNull(),
  bezahlt: integer('bezahlt', { mode: 'boolean' }).notNull().default(false),
  bezahltAm: text('bezahlt_am'),
  dokumentId: text('dokument_id').references(() => dokumente.id),
  erstellt: text('erstellt').notNull().default(sql`(datetime('now'))`),
})

// ─── Audit-Log ────────────────────────────────────────────────────────────────
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  aktion: text('aktion').notNull(),
  details: text('details'),   // JSON als Text
  ipAdresse: text('ip_adresse'),
  erstellt: text('erstellt').notNull().default(sql`(datetime('now'))`),
})

// ─── DSGVO-Anfragen ───────────────────────────────────────────────────────────
export const dsgvoAnfragen = sqliteTable('dsgvo_anfragen', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => benutzer.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  typ: text('typ', { enum: ['auskunft', 'loeschung', 'export'] }).notNull(),
  nachricht: text('nachricht'),
  bearbeitet: integer('bearbeitet', { mode: 'boolean' }).notNull().default(false),
  erstellt: text('erstellt').notNull().default(sql`(datetime('now'))`),
})

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => benutzer.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  ablauf: text('ablauf').notNull(),
  erstellt: text('erstellt').notNull().default(sql`(datetime('now'))`),
})

export type Benutzer = typeof benutzer.$inferSelect
export type NeuerBenutzer = typeof benutzer.$inferInsert
export type Registrierung = typeof registrierungen.$inferSelect
export type Dokument = typeof dokumente.$inferSelect
export type Rechnung = typeof rechnungen.$inferSelect
export type AuditLogEintrag = typeof auditLog.$inferSelect
