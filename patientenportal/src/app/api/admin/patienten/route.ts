import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/session'

export async function GET() {
  try {
    await requireAdmin()
    const allePatienten = await db.select().from(benutzer).where(eq(benutzer.rolle, 'patient'))
    const ohneHash = allePatienten.map(({ passwortHash: _, ...rest }) => rest)
    return NextResponse.json({ patienten: ohneHash })
  } catch {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }
}
