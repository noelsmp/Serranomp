import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { pruefePasswort, hashPasswort, validierePasswortStaerke } from '@/lib/auth/password'
import { logAktion } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const nutzer = await getSession()
  if (!nutzer) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const { altesPasswort, neuesPasswort, neuesPasswortWiederholung } = await req.json()

  if (!altesPasswort || !neuesPasswort || !neuesPasswortWiederholung) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 })
  }

  if (neuesPasswort !== neuesPasswortWiederholung) {
    return NextResponse.json({ error: 'Die neuen Passwörter stimmen nicht überein.' }, { status: 400 })
  }

  const staerkeFehler = validierePasswortStaerke(neuesPasswort)
  if (staerkeFehler) return NextResponse.json({ error: staerkeFehler }, { status: 400 })

  const [aktuell] = await db.select().from(benutzer).where(eq(benutzer.id, nutzer.id))
  const korrekt = await pruefePasswort(altesPasswort, aktuell.passwortHash)
  if (!korrekt) {
    return NextResponse.json({ error: 'Das aktuelle Passwort ist nicht korrekt.' }, { status: 400 })
  }

  const neuerHash = await hashPasswort(neuesPasswort)
  await db.update(benutzer).set({ passwortHash: neuerHash }).where(eq(benutzer.id, nutzer.id))

  await logAktion({
    userId: nutzer.id,
    aktion: 'passwort_geaendert',
    ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
  })

  return NextResponse.json({ ok: true })
}
