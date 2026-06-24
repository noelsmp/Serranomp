import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rechnungen } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  const nutzer = await getSession()
  if (!nutzer) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const meineRechnungen = await db
    .select()
    .from(rechnungen)
    .where(eq(rechnungen.patientId, nutzer.id))
    .orderBy(desc(rechnungen.ausstellungsdatum))

  return NextResponse.json({ rechnungen: meineRechnungen })
}
