import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { validateApiKey, apiKeyError } from '@/lib/api/apikey'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateApiKey(req)) return apiKeyError()

  const { id } = await params
  const [patient] = await db.select().from(benutzer).where(eq(benutzer.id, id))
  if (!patient || patient.rolle !== 'patient') {
    return NextResponse.json({ error: 'Patient nicht gefunden.' }, { status: 404 })
  }

  const { passwortHash: _, ...ohneHash } = patient
  return NextResponse.json({ patient: ohneHash })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateApiKey(req)) return apiKeyError()

  const { id } = await params
  const [patient] = await db.select().from(benutzer).where(eq(benutzer.id, id))
  if (!patient || patient.rolle !== 'patient') {
    return NextResponse.json({ error: 'Patient nicht gefunden.' }, { status: 404 })
  }

  const body = await req.json()
  const erlaubteFelder: Record<string, unknown> = {}

  if (typeof body.vorname === 'string' && body.vorname.trim()) erlaubteFelder.vorname = body.vorname.trim()
  if (typeof body.nachname === 'string' && body.nachname.trim()) erlaubteFelder.nachname = body.nachname.trim()
  if (typeof body.telefon === 'string') erlaubteFelder.telefon = body.telefon.trim() || null
  if (typeof body.geburtsdatum === 'string') erlaubteFelder.geburtsdatum = body.geburtsdatum || null
  if (typeof body.praxisPatientNr === 'string') erlaubteFelder.praxisPatientNr = body.praxisPatientNr.trim() || null
  if (body.status === 'aktiv' || body.status === 'gesperrt') erlaubteFelder.status = body.status

  if (Object.keys(erlaubteFelder).length === 0) {
    return NextResponse.json({ error: 'Keine gültigen Felder angegeben.' }, { status: 400 })
  }

  await db.update(benutzer).set(erlaubteFelder).where(eq(benutzer.id, id))
  const [aktualisiert] = await db.select().from(benutzer).where(eq(benutzer.id, id))
  const { passwortHash: _, ...ohneHash } = aktualisiert
  return NextResponse.json({ patient: ohneHash })
}
