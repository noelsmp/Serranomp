import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { validateApiKey, apiKeyError } from '@/lib/api/apikey'

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return apiKeyError()

  const allePatienten = await db.select().from(benutzer).where(eq(benutzer.rolle, 'patient'))
  const ohneHash = allePatienten.map(({ passwortHash: _, ...rest }) => rest)
  return NextResponse.json({ patienten: ohneHash })
}
