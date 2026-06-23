import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function logAktion(params: {
  userId?: string | null
  aktion: string
  details?: Record<string, unknown>
  ipAdresse?: string
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: nanoid(),
      userId: params.userId ?? null,
      aktion: params.aktion,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAdresse: params.ipAdresse ?? null,
    })
  } catch (error) {
    console.error('Audit-Log Fehler:', error)
  }
}
