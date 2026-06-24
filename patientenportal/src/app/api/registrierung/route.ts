import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registrierungen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail } from '@/lib/email/resend'
import { emailNeueRegistrierung } from '@/lib/email/templates'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const schema = z.object({
  vorname: z.string().min(1).max(100),
  nachname: z.string().min(1).max(100),
  email: z.string().email(),
  geburtsdatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  telefon: z.string().min(5).max(30),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const daten = schema.parse(body)

    const existing = await db.select().from(registrierungen).where(eq(registrierungen.email, daten.email))
    if (existing.length > 0) {
      const reg = existing[0]
      if (reg.status === 'ausstehend') {
        return NextResponse.json({ error: 'Eine Registrierungsanfrage für diese E-Mail-Adresse ist bereits in Bearbeitung.' }, { status: 409 })
      }
      if (reg.status === 'freigeschaltet') {
        return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.' }, { status: 409 })
      }
    }

    const token = nanoid(32)
    await db.insert(registrierungen).values({
      id: nanoid(),
      ...daten,
      datenschutzZugestimmt: true,
      nutzungsbedingungenZugestimmt: true,
      token,
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const praxisEmail = process.env.EMAIL_PRAXIS ?? 'info@naturheilpraxis-hilfreich.de'

    const { subject, html } = emailNeueRegistrierung({
      vorname: daten.vorname,
      nachname: daten.nachname,
      email: daten.email,
      geburtsdatum: daten.geburtsdatum,
      telefon: daten.telefon,
      freischaltLink: `${baseUrl}/api/freischaltung?token=${token}&aktion=freischalten`,
      ablehnungLink: `${baseUrl}/api/freischaltung?token=${token}&aktion=ablehnen`,
    })

    await sendEmail({ to: praxisEmail, subject, html })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Bitte füllen Sie alle Felder korrekt aus.' }, { status: 400 })
    }
    console.error('Registrierungs-Fehler:', error)
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }, { status: 500 })
  }
}
