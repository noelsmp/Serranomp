import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer, dokumente } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/session'

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
