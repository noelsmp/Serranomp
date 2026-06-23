import { NextResponse } from 'next/server'
import { loescheSession } from '@/lib/auth/session'

export async function POST() {
  await loescheSession()
  return NextResponse.json({ ok: true })
}
