import { migrate } from './migrate'
import { db } from './index'
import { benutzer, dokumente, rechnungen } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { speichereDatei } from '@/lib/storage'

// Minimales aber gültiges PDF als Platzhalter
const testPdf = (titel: string) => Buffer.from(
  `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n` +
  `2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n` +
  `3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n` +
  `4 0 obj<</Length 44>>\nstream\nBT /F1 16 Tf 50 750 Td (${titel}) Tj ET\nendstream\nendobj\n` +
  `5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n` +
  `xref\n0 6\n0000000000 65535 f\r\n` +
  `trailer<</Size 6/Root 1 0 R>>\nstartxref\n500\n%%EOF`
)

async function seed() {
  await migrate()

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'info@naturheilpraxis-hilfreich.de'
  const adminPasswort = process.env.ADMIN_INITIAL_PASSWORD ?? 'Admin2024!'

  const existingAdmin = await db.select().from(benutzer).where(eq(benutzer.email, adminEmail))
  if (existingAdmin.length === 0) {
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
    console.log(`✓ Admin-Konto erstellt: ${adminEmail} / ${adminPasswort}`)
  } else {
    console.log('  Admin-Konto existiert bereits.')
  }

  // ── Testpatient 1: Maria Müller ────────────────────────────────────────────
  const patient1Email = 'maria.mueller@example.de'
  const existing1 = await db.select().from(benutzer).where(eq(benutzer.email, patient1Email))

  if (existing1.length === 0) {
    const patient1Id = nanoid()
    const hash1 = await bcrypt.hash('Patient2024!', 12)

    await db.insert(benutzer).values({
      id: patient1Id,
      email: patient1Email,
      passwortHash: hash1,
      vorname: 'Maria',
      nachname: 'Müller',
      geburtsdatum: '1975-03-15',
      telefon: '02841 123456',
      rolle: 'patient',
      status: 'aktiv',
      praxisPatientNr: 'P-001',
    })

    // Dokument 1: Anamnesebogen
    const dok1Id = nanoid()
    const pfad1 = `${patient1Id}/test-anamnesebogen.pdf`
    await speichereDatei(testPdf('Anamnesebogen Maria Mueller'), pfad1)
    await db.insert(dokumente).values({
      id: dok1Id,
      patientId: patient1Id,
      name: 'Anamnesebogen_Erstbesuch.pdf',
      kategorie: 'anamnesebogen',
      dateipfad: pfad1,
      dateigroesse: 1024,
      mimeType: 'application/pdf',
      hochgeladenVon: 'patient',
      hochgeladenVonName: 'Maria Müller',
    })

    // Dokument 2: Befund
    const dok2Id = nanoid()
    const pfad2 = `${patient1Id}/test-befund.pdf`
    await speichereDatei(testPdf('Befundbericht Maria Mueller'), pfad2)
    await db.insert(dokumente).values({
      id: dok2Id,
      patientId: patient1Id,
      name: 'Befundbericht_2024-11.pdf',
      kategorie: 'behandlung',
      dateipfad: pfad2,
      dateigroesse: 2048,
      mimeType: 'application/pdf',
      hochgeladenVon: 'praxis',
      hochgeladenVonName: 'Praxis',
    })

    // Dokument 3: Rechnung (als PDF)
    const dok3Id = nanoid()
    const pfad3 = `${patient1Id}/test-rechnung-001.pdf`
    await speichereDatei(testPdf('Rechnung 2024-001'), pfad3)
    await db.insert(dokumente).values({
      id: dok3Id,
      patientId: patient1Id,
      name: 'Rechnung_2024-001.pdf',
      kategorie: 'rechnung',
      dateipfad: pfad3,
      dateigroesse: 1536,
      mimeType: 'application/pdf',
      hochgeladenVon: 'praxis',
      hochgeladenVonName: 'Praxis',
    })

    // Rechnungen
    await db.insert(rechnungen).values([
      {
        id: nanoid(),
        patientId: patient1Id,
        rechnungsnr: '2024-001',
        ausstellungsdatum: '2024-11-05',
        faelligkeitsdatum: '2024-11-26',
        gesamtbetrag: 89.50,
        bezahlt: true,
        bezahltAm: '2024-11-20',
        dokumentId: dok3Id,
      },
      {
        id: nanoid(),
        patientId: patient1Id,
        rechnungsnr: '2025-004',
        ausstellungsdatum: '2025-01-15',
        faelligkeitsdatum: '2025-02-05',
        gesamtbetrag: 124.00,
        bezahlt: false,
      },
    ])

    console.log(`✓ Testpatient 1: ${patient1Email} / Patient2024!`)
  } else {
    console.log('  Testpatient 1 existiert bereits.')
  }

  // ── Testpatient 2: Thomas Schneider ───────────────────────────────────────
  const patient2Email = 'thomas.schneider@example.de'
  const existing2 = await db.select().from(benutzer).where(eq(benutzer.email, patient2Email))

  if (existing2.length === 0) {
    const patient2Id = nanoid()
    const hash2 = await bcrypt.hash('Patient2024!', 12)

    await db.insert(benutzer).values({
      id: patient2Id,
      email: patient2Email,
      passwortHash: hash2,
      vorname: 'Thomas',
      nachname: 'Schneider',
      geburtsdatum: '1982-07-22',
      telefon: '02841 654321',
      rolle: 'patient',
      status: 'aktiv',
      praxisPatientNr: 'P-002',
    })

    // Dokument: Vorlage Schmerztagebuch
    const dok4Id = nanoid()
    const pfad4 = `${patient2Id}/test-vorlage.pdf`
    await speichereDatei(testPdf('Vorlage Schmerztagebuch Thomas Schneider'), pfad4)
    await db.insert(dokumente).values({
      id: dok4Id,
      patientId: patient2Id,
      name: 'Vorlage_Schmerztagebuch.pdf',
      kategorie: 'vorlage',
      dateipfad: pfad4,
      dateigroesse: 512,
      mimeType: 'application/pdf',
      hochgeladenVon: 'praxis',
      hochgeladenVonName: 'Praxis',
    })

    // Rechnung (bezahlt)
    const dok5Id = nanoid()
    const pfad5 = `${patient2Id}/test-rechnung-002.pdf`
    await speichereDatei(testPdf('Rechnung 2025-001'), pfad5)
    await db.insert(dokumente).values({
      id: dok5Id,
      patientId: patient2Id,
      name: 'Rechnung_2025-001.pdf',
      kategorie: 'rechnung',
      dateipfad: pfad5,
      dateigroesse: 1536,
      mimeType: 'application/pdf',
      hochgeladenVon: 'praxis',
      hochgeladenVonName: 'Praxis',
    })

    await db.insert(rechnungen).values({
      id: nanoid(),
      patientId: patient2Id,
      rechnungsnr: '2025-001',
      ausstellungsdatum: '2025-01-08',
      faelligkeitsdatum: '2025-01-29',
      gesamtbetrag: 65.00,
      bezahlt: true,
      bezahltAm: '2025-01-25',
      dokumentId: dok5Id,
    })

    console.log(`✓ Testpatient 2: ${patient2Email} / Patient2024!`)
  } else {
    console.log('  Testpatient 2 existiert bereits.')
  }

  console.log('\nFertig! Zugangsdaten:')
  console.log('  Admin:      info@naturheilpraxis-hilfreich.de / Admin2024!')
  console.log('  Patient 1:  maria.mueller@example.de / Patient2024!')
  console.log('  Patient 2:  thomas.schneider@example.de / Patient2024!')
}

seed().catch(console.error)
