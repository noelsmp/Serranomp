import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { benutzer, passwortResetTokens } from '@/lib/db/schema'
import { eq, lt } from 'drizzle-orm'
import { sendEmail } from '@/lib/email/resend'
import { emailPasswortReset } from '@/lib/email/templates'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: true })
    }

    const [nutzer] = await db.select().from(benutzer).where(eq(benutzer.email, email.toLowerCase().trim()))

    // Always return ok to prevent user enumeration
    if (!nutzer || nutzer.rolle !== 'patient' || nutzer.status !== 'aktiv') {
      return NextResponse.json({ ok: true })
    }

    const jetzt = new Date()

    // Delete expired tokens for this user
    await db
      .delete(passwortResetTokens)
      .where(lt(passwortResetTokens.ablauf, jetzt.toISOString()))

    const token = nanoid(48)
    const ablauf = new Date(jetzt.getTime() + 60 * 60 * 1000).toISOString()

    await db.insert(passwortResetTokens).values({
      id: nanoid(),
      userId: nutzer.id,
      token,
      ablauf,
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const resetLink = `${baseUrl}/passwort-neu-setzen?token=${token}`

    const { subject, html } = emailPasswortReset({ vorname: nutzer.vorname, resetLink })
    await sendEmail({ to: nutzer.email, subject, html })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
