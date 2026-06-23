import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { dokumente, rechnungen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FileText, Receipt, Upload, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDatum } from '@/types'

export default async function DashboardPage() {
  const nutzer = await getSession()
  if (!nutzer) return null

  const meineDokumente = db.select().from(dokumente).where(eq(dokumente.patientId, nutzer.id)).all()
  const meineRechnungen = db.select().from(rechnungen).where(eq(rechnungen.patientId, nutzer.id)).all()

  const offeneRechnungen = meineRechnungen.filter(r => !r.bezahlt)
  const neueDokumente = meineDokumente
    .sort((a, b) => b.erstellt.localeCompare(a.erstellt))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-text">Guten Tag, {nutzer.vorname}</h1>
        <p className="font-sans text-sm text-muted mt-1">Willkommen in Ihrem Patientenportal</p>
      </div>

      {/* Schnellübersicht */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-sage-lt rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-sage" />
            </div>
            <div>
              <p className="font-sans text-2xl text-text font-semibold">{meineDokumente.length}</p>
              <p className="font-sans text-xs text-muted">Dokumente</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-sans text-2xl text-text font-semibold">{meineRechnungen.length}</p>
              <p className="font-sans text-xs text-muted">Rechnungen gesamt</p>
            </div>
          </CardContent>
        </Card>

        <Card className={offeneRechnungen.length > 0 ? 'border-amber-300' : ''}>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-sans text-2xl text-text font-semibold">{offeneRechnungen.length}</p>
              <p className="font-sans text-xs text-muted">Offene Rechnungen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Neueste Dokumente */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-text">Neueste Dokumente</h2>
          <Link href="/dokumente" className="font-sans text-sm text-sage hover:text-sage-dk flex items-center gap-1 no-underline">
            Alle ansehen <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {neueDokumente.length === 0 ? (
            <p className="font-sans text-sm text-muted py-4">Noch keine Dokumente vorhanden.</p>
          ) : (
            <div className="divide-y divide-border">
              {neueDokumente.map(dok => (
                <div key={dok.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted flex-shrink-0" />
                    <div>
                      <p className="font-sans text-sm text-text">{dok.name}</p>
                      <p className="font-sans text-xs text-muted">{formatDatum(dok.erstellt)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/download/${dok.id}`}
                    className="font-sans text-xs text-sage hover:text-sage-dk no-underline"
                  >
                    Laden
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dokument hochladen */}
      <Card className="border-dashed border-2">
        <CardContent className="py-8 text-center">
          <Upload className="w-8 h-8 text-muted mx-auto mb-3" />
          <h3 className="font-serif text-text mb-1">Dokument hochladen</h3>
          <p className="font-sans text-sm text-muted mb-4">
            Laden Sie Befunde, ausgefüllte Anamnesebögen oder andere Unterlagen hoch.
          </p>
          <Link
            href="/dokumente"
            className="inline-flex items-center gap-2 bg-sage text-white font-sans text-sm px-4 py-2 rounded hover:bg-sage-dk transition-colors no-underline"
          >
            <Upload className="w-4 h-4" />
            Zu meinen Dokumenten
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
