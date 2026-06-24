import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registrierungen, benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail } from '@/lib/email/resend'
import { emailFreischaltungBestaetigung, emailAblehnung } from '@/lib/email/templates'
import { hashPasswort } from '@/lib/auth/password'
import { nanoid } from 'nanoid'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const aktion = searchParams.get('aktion') as 'freischalten' | 'ablehnen' | null

  if (!token || !aktion) return new NextResponse('Ungültiger Link.', { status: 400 })

  const [reg] = await db.select().from(registrierungen).where(eq(registrierungen.token, token))
  if (!reg) return new NextResponse('Registrierung nicht gefunden.', { status: 404 })

  if (reg.status !== 'ausstehend') {
    return new NextResponse(`Diese Registrierung wurde bereits ${reg.status === 'freigeschaltet' ? 'freigeschaltet' : 'abgelehnt'}.`, { status: 409 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (aktion === 'freischalten') {
    const tempPasswort = `Praxis${nanoid(8)}!`
    const hash = await hashPasswort(tempPasswort)

    await db.insert(benutzer).values({
      id: nanoid(),
      email: reg.email,
      passwortHash: hash,
      vorname: reg.vorname,
      nachname: reg.nachname,
      geburtsdatum: reg.geburtsdatum,
      telefon: reg.telefon,
      rolle: 'patient',
      status: 'aktiv',
    })

    await db.update(registrierungen).set({ status: 'freigeschaltet', bearbeitetAm: new Date().toISOString() }).where(eq(registrierungen.token, token))

    const { subject, html } = emailFreischaltungBestaetigung({
      vorname: reg.vorname,
      loginLink: `${baseUrl}/login`,
      tempPasswort,
    })
    await sendEmail({ to: reg.email, subject, html })

    return new NextResponse(`
      <html lang="de"><head><meta charset="UTF-8"><title>Freigeschaltet</title></head>
      <body style="font-family:Arial,sans-serif;padding:40px;background:#f9f6f0;color:#2d2d2d;">
        <h1 style="color:#4e6b53;">✓ Zugang freigeschaltet</h1>
        <p>${reg.vorname} ${reg.nachname} wurde freigeschaltet. Eine Bestätigungs-E-Mail wurde versendet.</p>
        <a href="${baseUrl}/admin" style="color:#6b8f71;">→ Zum Admin-Dashboard</a>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  if (aktion === 'ablehnen') {
    await db.update(registrierungen).set({ status: 'abgelehnt', bearbeitetAm: new Date().toISOString() }).where(eq(registrierungen.token, token))

    const { subject, html } = emailAblehnung({
      vorname: reg.vorname,
      nachname: reg.nachname,
      praxisEmail: process.env.EMAIL_PRAXIS ?? 'info@naturheilpraxis-hilfreich.de',
      praxisTelefon: process.env.PRAXIS_TELEFON ?? '02841 / Ihre Nummer',
    })
    await sendEmail({ to: reg.email, subject, html })

    return new NextResponse(`
      <html lang="de"><head><meta charset="UTF-8"><title>Abgelehnt</title></head>
      <body style="font-family:Arial,sans-serif;padding:40px;background:#f9f6f0;color:#2d2d2d;">
        <h1 style="color:#b45309;">Registrierung abgelehnt</h1>
        <p>Die Anfrage von ${reg.vorname} ${reg.nachname} wurde abgelehnt.</p>
        <a href="${baseUrl}/admin" style="color:#6b8f71;">→ Zum Admin-Dashboard</a>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  return new NextResponse('Ungültige Aktion.', { status: 400 })
}
