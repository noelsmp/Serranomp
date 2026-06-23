import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dokumente } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  const nutzer = await getSession()
  if (!nutzer) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const meineDokumente = db
    .select()
    .from(dokumente)
    .where(eq(dokumente.patientId, nutzer.id))
    .orderBy(desc(dokumente.erstellt))
    .all()

  return NextResponse.json({ dokumente: meineDokumente, patientId: nutzer.id })
}
