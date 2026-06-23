import { migrate } from './migrate'
import { db } from './index'
import { benutzer } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

async function seed() {
  await migrate()

  const adminEmail = process.env.ADMIN_EMAIL ?? 'info@naturheilpraxis-hilfreich.de'
  const adminPasswort = process.env.ADMIN_INITIAL_PASSWORD ?? 'Admin2024!'

  const existing = await db.select().from(benutzer).where(eq(benutzer.email, adminEmail))
  if (existing.length > 0) {
    console.log('Admin-Konto existiert bereits.')
    return
  }

  const hash = await bcrypt.hash(adminPasswort, 12)
  await db.insert(benutzer).values({
    id: nanoid(),
    email: adminEmail,
    passwortHash: hash,
    vorname: 'Admin',
    nachname: 'Praxis',
    rolle: 'admin',
    status: 'aktiv',
  })

  console.log(`Admin-Konto erstellt: ${adminEmail}`)
  console.log(`Initiales Passwort: ${adminPasswort}`)
  console.log('WICHTIG: Passwort nach dem ersten Login ändern!')
}

seed().catch(console.error)
