import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer, passwortResetTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPasswort, validierePasswortStaerke } from '@/lib/auth/password'
import { logAktion } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const { token, neuesPasswort, neuesPasswortWiederholung } = await req.json()

    if (!token || !neuesPasswort || !neuesPasswortWiederholung) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 })
    }

    if (neuesPasswort !== neuesPasswortWiederholung) {
      return NextResponse.json({ error: 'Die Passwörter stimmen nicht überein.' }, { status: 400 })
    }

    const fehler = validierePasswortStaerke(neuesPasswort)
    if (fehler) return NextResponse.json({ error: fehler }, { status: 400 })

    const [resetToken] = await db
      .select()
      .from(passwortResetTokens)
      .where(eq(passwortResetTokens.token, token))

    if (!resetToken) {
      return NextResponse.json({ error: 'Ungültiger oder abgelaufener Link.' }, { status: 400 })
    }

    if (new Date(resetToken.ablauf) < new Date()) {
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
  } catch {
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten.' }, { status: 500 })
  }
}
