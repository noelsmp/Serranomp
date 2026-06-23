import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

const DB_DIR = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join(process.cwd(), 'data')

const DB_FILE = process.env.DB_PATH ?? path.join(DB_DIR, 'portal.db')

// Verzeichnis anlegen falls nicht vorhanden
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const sqlite = new Database(DB_FILE)

// Performance-Optimierungen für SQLite
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
sqlite.pragma('synchronous = NORMAL')

export const db = drizzle(sqlite, { schema })

export { sqlite }
