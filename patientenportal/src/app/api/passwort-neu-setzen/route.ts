import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer, passwortResetTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPasswort, validierePasswortStaerke } from '@/lib/auth/password'
import { logAktion } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const { token, neuesPasswort, neuesPasswortWiederholung } = await req.json()

  if (!token || !neuesPasswort || !neuesPasswortWiederholung) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 })
  }

  if (neuesPasswort !== neuesPasswortWiederholung) {
    return NextResponse.json({ error: 'Die Passwörter stimmen nicht überein.' }, { status: 400 })
  }

  const staerkeFehler = validierePasswortStaerke(neuesPasswort)
  if (staerkeFehler) return NextResponse.json({ error: staerkeFehler }, { status: 400 })

  const [resetToken] = await db.select().from(passwortResetTokens).where(eq(passwortResetTokens.token, token))

  if (!resetToken) {
    return NextResponse.json({ error: 'Dieser Link ist ungültig oder bereits verwendet.' }, { status: 400 })
  }

  if (resetToken.ablauf < new Date().toISOString()) {
    await db.delete(passwortResetTokens).where(eq(passwortResetTokens.token, token))
    return NextResponse.json({ error: 'Dieser Link ist abgelaufen. Bitte fordern Sie einen neuen an.' }, { status: 400 })
  }

  const neuerHash = await hashPasswort(neuesPasswort)
  await db.update(benutzer).set({ passwortHash: neuerHash }).where(eq(benutzer.id, resetToken.userId))
  await db.delete(passwortResetTokens).where(eq(passwortResetTokens.token, token))

  await logAktion({
    userId: resetToken.userId,
    aktion: 'passwort_zurueckgesetzt',
    ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
  })

  return NextResponse.json({ ok: true })
}
