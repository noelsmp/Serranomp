import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dokumente } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { leseDatei, dateiExistiert } from '@/lib/storage'
import { logAktion } from '@/lib/audit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const nutzer = await getSession()
  if (!nutzer) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const { id } = await params
  const [dokument] = await db.select().from(dokumente).where(eq(dokumente.id, id))

  if (!dokument) return NextResponse.json({ error: 'Dokument nicht gefunden.' }, { status: 404 })
  if (nutzer.rolle !== 'admin' && dokument.patientId !== nutzer.id) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  if (!dateiExistiert(dokument.dateipfad)) return NextResponse.json({ error: 'Datei nicht gefunden.' }, { status: 404 })

  await logAktion({
    userId: nutzer.id,
    aktion: 'dokument_heruntergeladen',
    details: { dokumentId: id, dateiname: dokument.name },
    ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
  })

  const dateiinhalt = leseDatei(dokument.dateipfad)

  return new NextResponse(dateiinhalt, {
    headers: {
      'Content-Type': dokument.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(dokument.name)}"`,
      'Content-Length': dateiinhalt.length.toString(),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
