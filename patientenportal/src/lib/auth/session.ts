import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { sessions, benutzer } from '@/lib/db/schema'
import { eq, lt } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { Benutzer } from '@/lib/db/schema'

const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT_SECONDS ?? '1800') * 1000
const COOKIE_NAME = 'portal_session'

export async function erstelleSession(userId: string): Promise<string> {
  const token = nanoid(64)
  const ablauf = new Date(Date.now() + SESSION_TIMEOUT).toISOString()

  await db.insert(sessions).values({ id: nanoid(), userId, token, ablauf })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TIMEOUT / 1000,
    path: '/',
  })

  return token
}

export async function getSession(): Promise<Benutzer | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const jetzt = new Date().toISOString()

  await db.delete(sessions).where(lt(sessions.ablauf, jetzt))

  const [session] = await db.select().from(sessions).where(eq(sessions.token, token))
  if (!session || session.ablauf < jetzt) return null

  const neuerAblauf = new Date(Date.now() + SESSION_TIMEOUT).toISOString()
  await db.update(sessions).set({ ablauf: neuerAblauf }).where(eq(sessions.token, token))

  const [nutzer] = await db.select().from(benutzer).where(eq(benutzer.id, session.userId))
  if (!nutzer || nutzer.status !== 'aktiv') return null

  return nutzer
}

export async function loescheSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) await db.delete(sessions).where(eq(sessions.token, token))
  cookieStore.delete(COOKIE_NAME)
}

export async function requireSession(): Promise<Benutzer> {
  const nutzer = await getSession()
  if (!nutzer) throw new Error('NICHT_ANGEMELDET')
  return nutzer
}

export async function requireAdmin(): Promise<Benutzer> {
  const nutzer = await requireSession()
  if (nutzer.rolle !== 'admin') throw new Error('KEIN_ZUGRIFF')
  return nutzer
}
