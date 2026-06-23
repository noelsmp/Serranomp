import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { pruefePasswort } from '@/lib/auth/password'
import { erstelleSession } from '@/lib/auth/session'
import { logAktion } from '@/lib/audit'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  passwort: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, passwort } = schema.parse(body)

    const nutzer = db.select().from(benutzer).where(eq(benutzer.email, email.toLowerCase())).get()

    if (!nutzer) {
      return NextResponse.json({ error: 'E-Mail-Adresse oder Passwort ist nicht korrekt.' }, { status: 401 })
    }

    if (nutzer.status === 'gesperrt') {
      return NextResponse.json({ error: 'Ihr Konto ist gesperrt. Bitte kontaktieren Sie die Praxis.' }, { status: 403 })
    }

    const korrekt = await pruefePasswort(passwort, nutzer.passwortHash)
    if (!korrekt) {
      logAktion({ aktion: 'login_fehlgeschlagen', details: { email }, ipAdresse: req.headers.get('x-forwarded-for') ?? undefined })
      return NextResponse.json({ error: 'E-Mail-Adresse oder Passwort ist nicht korrekt.' }, { status: 401 })
    }

    await erstelleSession(nutzer.id)

    logAktion({
      userId: nutzer.id,
      aktion: 'login',
      ipAdresse: req.headers.get('x-forwarded-for') ?? undefined,
    })

    // Letzten Login aktualisieren
    db.update(benutzer).set({ letzterLogin: new Date().toISOString() }).where(eq(benutzer.id, nutzer.id)).run()

    return NextResponse.json({
      rolle: nutzer.rolle,
      redirect: nutzer.rolle === 'admin' ? '/admin' : '/dashboard',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 })
    }
    console.error('Login-Fehler:', error)
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten.' }, { status: 500 })
  }
}
