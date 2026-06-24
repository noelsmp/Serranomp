import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { logAktion } from '@/lib/audit'

export async function PATCH(req: NextRequest) {
  const nutzer = await getSession()
  if (!nutzer) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const body = await req.json()
  const erlaubteFelder: Record<string, unknown> = {}

  if (typeof body.vorname === 'string' && body.vorname.trim()) erlaubteFelder.vorname = body.vorname.trim()
  if (typeof body.nachname === 'string' && body.nachname.trim()) erlaubteFelder.nachname = body.nachname.trim()
  if (typeof body.telefon === 'string') erlaubteFelder.telefon = body.telefon.trim() || null
  if (typeof body.geburtsdatum === 'string') erlaubteFelder.geburtsdatum = body.geburtsdatum || null

  if (Object.keys(erlaubteFelder).length === 0) {
    return NextResponse.json({ error: 'Keine gültigen Felder angegeben.' }, { status: 400 })
  }

  await db.update(benutzer).set(erlaubteFelder).where(eq(benutzer.id, nutzer.id))

  await logAktion({
    userId: nutzer.id,
    aktion: 'profil_aktualisiert',
    details: { felder: Object.keys(erlaubteFelder) },
    ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
  })

  const [aktualisiert] = await db.select().from(benutzer).where(eq(benutzer.id, nutzer.id))
  const { passwortHash: _, ...ohneHash } = aktualisiert
  return NextResponse.json({ benutzer: ohneHash })
}
