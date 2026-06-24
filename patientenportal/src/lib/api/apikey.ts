import { NextRequest } from 'next/server'

export function validateApiKey(req: NextRequest): boolean {
  const apiKey = process.env.PORTAL_API_KEY
  if (!apiKey) return false
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return false
  return auth.slice(7) === apiKey
}

export function apiKeyError() {
  return Response.json({ error: 'Ungültiger oder fehlender API-Key.' }, { status: 401 })
}
