import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rechnungen, benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/session'
import { logAktion } from '@/lib/audit'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { patientId, rechnungsnr, ausstellungsdatum, faelligkeitsdatum, gesamtbetrag, dokumentId } = body

    if (!patientId || !rechnungsnr || !ausstellungsdatum || !faelligkeitsdatum || gesamtbetrag == null) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 })
    }

    const [patient] = await db.select().from(benutzer).where(eq(benutzer.id, patientId))
    if (!patient || patient.rolle !== 'patient') {
      return NextResponse.json({ error: 'Patient nicht gefunden.' }, { status: 404 })
    }

    const id = nanoid()
    await db.insert(rechnungen).values({
      id,
      patientId,
      rechnungsnr,
      ausstellungsdatum,
      faelligkeitsdatum,
      gesamtbetrag: parseFloat(gesamtbetrag),
      bezahlt: false,
      dokumentId: dokumentId ?? null,
    })

    await logAktion({
      userId: admin.id,
      aktion: 'rechnung_erstellt',
      details: { rechnungId: id, rechnungsnr, patientId },
      ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }
}
