import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rechnungen, benutzer } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { validateApiKey, apiKeyError } from '@/lib/api/apikey'
import { nanoid } from 'nanoid'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateApiKey(req)) return apiKeyError()

  const { id } = await params
  const patientRechnungen = await db
    .select()
    .from(rechnungen)
    .where(eq(rechnungen.patientId, id))
    .orderBy(desc(rechnungen.ausstellungsdatum))

  return NextResponse.json({ rechnungen: patientRechnungen })
}

export async function POST(
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
  const { rechnungsnr, ausstellungsdatum, faelligkeitsdatum, gesamtbetrag, dokumentId } = body

  if (!rechnungsnr || !ausstellungsdatum || !faelligkeitsdatum || gesamtbetrag == null) {
    return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 })
  }

  const rechnungId = nanoid()
  await db.insert(rechnungen).values({
    id: rechnungId,
    patientId: id,
    rechnungsnr,
    ausstellungsdatum,
    faelligkeitsdatum,
    gesamtbetrag: parseFloat(gesamtbetrag),
    bezahlt: false,
    dokumentId: dokumentId ?? null,
  })

  return NextResponse.json({ ok: true, id: rechnungId }, { status: 201 })
}
