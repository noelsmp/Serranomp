import { migrate } from './migrate'
import { db } from './index'
import { benutzer } from './schema'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

async function seed() {
  migrate()

  const adminEmail = process.env.ADMIN_EMAIL ?? 'info@naturheilpraxis-hilfreich.de'
  const adminPasswort = process.env.ADMIN_INITIAL_PASSWORD ?? 'Admin2024!'

  const existing = db.select().from(benutzer).all().find(u => u.email === adminEmail)
  if (existing) {
    console.log('Admin-Konto existiert bereits.')
    return
  }

  const hash = await bcrypt.hash(adminPasswort, 12)
  db.insert(benutzer).values({
    id: nanoid(),
    email: adminEmail,
    passwortHash: hash,
    vorname: 'Admin',
    nachname: 'Praxis',
    rolle: 'admin',
    status: 'aktiv',
  }).run()

  console.log(`Admin-Konto erstellt: ${adminEmail}`)
  console.log(`Initiales Passwort: ${adminPasswort}`)
  console.log('WICHTIG: Passwort nach dem ersten Login ändern!')
}

seed().catch(console.error)
