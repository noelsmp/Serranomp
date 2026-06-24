import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rechnungen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/session'
import { logAktion } from '@/lib/audit'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    const [rechnung] = await db.select().from(rechnungen).where(eq(rechnungen.id, id))
    if (!rechnung) return NextResponse.json({ error: 'Rechnung nicht gefunden.' }, { status: 404 })

    const body = await req.json()
    const updates: Record<string, unknown> = {}

    if (typeof body.bezahlt === 'boolean') {
      updates.bezahlt = body.bezahlt
      updates.bezahltAm = body.bezahlt ? (body.bezahltAm ?? new Date().toISOString().slice(0, 10)) : null
    }
    if (typeof body.rechnungsnr === 'string') updates.rechnungsnr = body.rechnungsnr
    if (typeof body.gesamtbetrag === 'number') updates.gesamtbetrag = body.gesamtbetrag
    if (typeof body.faelligkeitsdatum === 'string') updates.faelligkeitsdatum = body.faelligkeitsdatum
    if (body.dokumentId !== undefined) updates.dokumentId = body.dokumentId ?? null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Keine Felder angegeben.' }, { status: 400 })
    }

    await db.update(rechnungen).set(updates).where(eq(rechnungen.id, id))

    await logAktion({
      userId: admin.id,
      aktion: 'rechnung_aktualisiert',
      details: { rechnungId: id, felder: Object.keys(updates) },
      ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
    })

    const [aktualisiert] = await db.select().from(rechnungen).where(eq(rechnungen.id, id))
    return NextResponse.json({ rechnung: aktualisiert })
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

    const [rechnung] = await db.select().from(rechnungen).where(eq(rechnungen.id, id))
    if (!rechnung) return NextResponse.json({ error: 'Rechnung nicht gefunden.' }, { status: 404 })

    await db.delete(rechnungen).where(eq(rechnungen.id, id))

    await logAktion({
      userId: admin.id,
      aktion: 'rechnung_geloescht',
      details: { rechnungId: id, rechnungsnr: rechnung.rechnungsnr },
      ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 })
  }
}
