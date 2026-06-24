import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer, passwortResetTokens } from '@/lib/db/schema'
import { eq, lt } from 'drizzle-orm'
import { sendEmail } from '@/lib/email/resend'
import { emailPasswortReset } from '@/lib/email/templates'
import { nanoid } from 'nanoid'

const ABLAUF_MS = 60 * 60 * 1000 // 1 Stunde

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  // Immer gleiche Antwort – verhindert User-Enumeration
  const okAntwort = NextResponse.json({ ok: true })

  if (!email || typeof email !== 'string') return okAntwort

  const [nutzer] = await db.select().from(benutzer).where(eq(benutzer.email, email.toLowerCase().trim()))
  if (!nutzer || nutzer.status !== 'aktiv') return okAntwort

  // Abgelaufene Tokens löschen
  await db.delete(passwortResetTokens).where(lt(passwortResetTokens.ablauf, new Date().toISOString()))

  const token = nanoid(48)
  const ablauf = new Date(Date.now() + ABLAUF_MS).toISOString()

  await db.insert(passwortResetTokens).values({
    id: nanoid(),
    userId: nutzer.id,
    token,
    ablauf,
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resetLink = `${baseUrl}/passwort-neu-setzen?token=${token}`

  const { subject, html } = emailPasswortReset({ vorname: nutzer.vorname, resetLink })
  await sendEmail({ to: nutzer.email, subject, html }).catch(console.error)

  return okAntwort
}
