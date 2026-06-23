import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dokumente, benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { speichereDatei, dateipfadFuerUpload } from '@/lib/storage'
import { sendEmail } from '@/lib/email/resend'
import { emailDokumentHochgeladen } from '@/lib/email/templates'
import { logAktion } from '@/lib/audit'
import { nanoid } from 'nanoid'
import type { DokumentKategorie } from '@/types'

const MAX_GROESSE = 10 * 1024 * 1024 // 10 MB
const ERLAUBTE_TYPEN = ['application/pdf', 'image/jpeg', 'image/png']

export async function POST(req: NextRequest) {
  try {
    const nutzer = await getSession()
    if (!nutzer) {
      return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
    }

    const formData = await req.formData()
    const datei = formData.get('datei') as File | null
    const kategorie = formData.get('kategorie') as DokumentKategorie | null
    const patientId = (formData.get('patientId') as string) || nutzer.id

    if (!datei || !kategorie) {
      return NextResponse.json({ error: 'Datei und Kategorie sind erforderlich.' }, { status: 400 })
    }

    // Nur Admin darf für andere Patienten hochladen
    if (patientId !== nutzer.id && nutzer.rolle !== 'admin') {
      return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
    }

    if (!ERLAUBTE_TYPEN.includes(datei.type)) {
      return NextResponse.json({ error: 'Nur PDF, JPEG und PNG sind erlaubt.' }, { status: 400 })
    }

    if (datei.size > MAX_GROESSE) {
      return NextResponse.json({ error: 'Datei darf maximal 10 MB groß sein.' }, { status: 400 })
    }

    const relativerPfad = dateipfadFuerUpload(patientId, datei.name)
    const puffer = Buffer.from(await datei.arrayBuffer())
    await speichereDatei(puffer, relativerPfad)

    const dokumentId = nanoid()
    db.insert(dokumente).values({
      id: dokumentId,
      patientId,
      name: datei.name,
      kategorie,
      dateipfad: relativerPfad,
      dateigroesse: datei.size,
      mimeType: datei.type,
      hochgeladenVon: nutzer.rolle === 'admin' ? 'praxis' : 'patient',
      hochgeladenVonName: nutzer.rolle === 'admin' ? 'Praxis' : `${nutzer.vorname} ${nutzer.nachname}`,
    }).run()

    logAktion({
      userId: nutzer.id,
      aktion: 'dokument_hochgeladen',
      details: { dokumentId, dateiname: datei.name, kategorie, fuer: patientId },
      ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
    })

    // E-Mail-Benachrichtigungen
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (nutzer.rolle === 'admin') {
      // Praxis lädt hoch → E-Mail an Patient
      const patient = db.select().from(benutzer).where(eq(benutzer.id, patientId)).get()
      if (patient) {
        const { emailDokumentBereitgestellt } = await import('@/lib/email/templates')
        const { subject, html } = emailDokumentBereitgestellt({
          vorname: patient.vorname,
          dateiname: datei.name,
          kategorie: kategorie as string,
          portalLink: `${baseUrl}/dokumente`,
        })
        await sendEmail({ to: patient.email, subject, html }).catch(console.error)
      }
    } else {
      // Patient lädt hoch → E-Mail an Praxis
      const praxisEmail = process.env.EMAIL_PRAXIS ?? 'info@naturheilpraxis-hilfreich.de'
      const { subject, html } = emailDokumentHochgeladen({
        patientVorname: nutzer.vorname,
        patientNachname: nutzer.nachname,
        dateiname: datei.name,
        kategorie: kategorie as string,
        adminLink: `${baseUrl}/admin/patienten/${patientId}`,
      })
      await sendEmail({ to: praxisEmail, subject, html }).catch(console.error)
    }

    return NextResponse.json({ ok: true, id: dokumentId })
  } catch (error) {
    console.error('Upload-Fehler:', error)
    return NextResponse.json({ error: 'Hochladen fehlgeschlagen.' }, { status: 500 })
  }
}
