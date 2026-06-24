import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dokumente, benutzer } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { validateApiKey, apiKeyError } from '@/lib/api/apikey'
import { speichereDatei, dateipfadFuerUpload } from '@/lib/storage'
import { nanoid } from 'nanoid'
import type { DokumentKategorie } from '@/types'

const ERLAUBTE_TYPEN = ['application/pdf', 'image/jpeg', 'image/png']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateApiKey(req)) return apiKeyError()

  const { id } = await params
  const patientDokumente = await db
    .select()
    .from(dokumente)
    .where(eq(dokumente.patientId, id))
    .orderBy(desc(dokumente.erstellt))

  return NextResponse.json({ dokumente: patientDokumente })
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

  const formData = await req.formData()
  const datei = formData.get('datei') as File | null
  const kategorie = formData.get('kategorie') as DokumentKategorie | null

  if (!datei || !kategorie) {
    return NextResponse.json({ error: 'Datei und Kategorie sind erforderlich.' }, { status: 400 })
  }
  if (!ERLAUBTE_TYPEN.includes(datei.type)) {
    return NextResponse.json({ error: 'Nur PDF, JPEG und PNG sind erlaubt.' }, { status: 400 })
  }
  if (datei.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Datei darf maximal 10 MB groß sein.' }, { status: 400 })
  }

  const relativerPfad = dateipfadFuerUpload(id, datei.name)
  const puffer = Buffer.from(await datei.arrayBuffer())
  await speichereDatei(puffer, relativerPfad)

  const dokumentId = nanoid()
  await db.insert(dokumente).values({
    id: dokumentId,
    patientId: id,
    name: datei.name,
    kategorie,
    dateipfad: relativerPfad,
    dateigroesse: datei.size,
    mimeType: datei.type,
    hochgeladenVon: 'praxis',
    hochgeladenVonName: 'API',
  })

  return NextResponse.json({ ok: true, id: dokumentId }, { status: 201 })
}
