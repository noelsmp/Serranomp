import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer, dokumente } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/session'
import { logAktion } from '@/lib/audit'
import { loescheDatei } from '@/lib/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const [patient] = await db.select().from(benutzer).where(eq(benutzer.id, id))
    if (!patient || patient.rolle !== 'patient') {
      return NextResponse.json({ error: 'Patient nicht gefunden.' }, { status: 404 })
    }

    const patientDokumente = await db
      .select()
      .from(dokumente)
      .where(eq(dokumente.patientId, id))
      .orderBy(desc(dokumente.erstellt))

    const { passwortHash: _, ...patientOhneHash } = patient
    return NextResponse.json({ patient: patientOhneHash, dokumente: patientDokumente })
  } catch {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
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

    await logAktion({
      userId: admin.id,
      aktion: 'patient_aktualisiert',
      details: { patientId: id, felder: Object.keys(erlaubteFelder) },
      ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
    })

    const [aktualisiert] = await db.select().from(benutzer).where(eq(benutzer.id, id))
    const { passwortHash: _, ...ohneHash } = aktualisiert
    return NextResponse.json({ patient: ohneHash })
  } catch {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    const [patient] = await db.select().from(benutzer).where(eq(benutzer.id, id))
    if (!patient || patient.rolle !== 'patient') {
      return NextResponse.json({ error: 'Patient nicht gefunden.' }, { status: 404 })
    }

    const patientDokumente = await db.select().from(dokumente).where(eq(dokumente.patientId, id))
    for (const dok of patientDokumente) {
      loescheDatei(dok.dateipfad)
    }

    await db.delete(benutzer).where(eq(benutzer.id, id))

    await logAktion({
      userId: admin.id,
      aktion: 'patient_geloescht',
      details: { patientId: id, email: patient.email },
      ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }
}
