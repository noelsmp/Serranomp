import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export function logAktion(params: {
  userId?: string | null
  aktion: string
  details?: Record<string, unknown>
  ipAdresse?: string
}): void {
  try {
    db.insert(auditLog).values({
      id: nanoid(),
      userId: params.userId ?? null,
      aktion: params.aktion,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAdresse: params.ipAdresse ?? null,
    }).run()
  } catch (error) {
    console.error('Audit-Log Fehler:', error)
  }
}
