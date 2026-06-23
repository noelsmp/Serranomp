import { db } from '@/lib/db'
import { benutzer, registrierungen, dokumente } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, FileText, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDatumZeit } from '@/types'

export default async function AdminDashboardPage() {
  const allePatienten = db.select().from(benutzer).where(eq(benutzer.rolle, 'patient')).all()
  const ausstehend = db.select().from(registrierungen).where(eq(registrierungen.status, 'ausstehend')).all()
  const alleDokumente = db.select().from(dokumente).all()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-text">Administration</h1>
        <p className="font-sans text-sm text-muted mt-1">Naturheilpraxis Hilfreich – Patientenportal</p>
      </div>

      {/* Ausstehende Registrierungen — prominent anzeigen */}
      {ausstehend.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif text-lg text-amber-900">
              {ausstehend.length} ausstehende Registrierung{ausstehend.length > 1 ? 'en' : ''}
            </h2>
          </div>
          <div className="space-y-3">
            {ausstehend.map(reg => (
              <div key={reg.id} className="bg-white border border-amber-200 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-sans text-sm font-semibold text-text">{reg.vorname} {reg.nachname}</p>
                  <p className="font-sans text-xs text-muted">{reg.email} · {formatDatumZeit(reg.erstellt)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`/api/freischaltung?token=${reg.token}&aktion=freischalten`}
                    className="inline-flex items-center gap-1 bg-sage text-white font-sans text-xs px-3 py-1.5 rounded hover:bg-sage-dk transition-colors no-underline"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Freischalten
                  </a>
                  <a
                    href={`/api/freischaltung?token=${reg.token}&aktion=ablehnen`}
                    className="inline-flex items-center gap-1 bg-red-700 text-white font-sans text-xs px-3 py-1.5 rounded hover:bg-red-800 transition-colors no-underline"
                  >
                    Ablehnen
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiken */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-sage-lt rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-sage" />
            </div>
            <div>
              <p className="font-sans text-2xl text-text font-semibold">{allePatienten.length}</p>
              <p className="font-sans text-xs text-muted">Aktive Patienten</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-sans text-2xl text-text font-semibold">{alleDokumente.length}</p>
              <p className="font-sans text-xs text-muted">Dokumente gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card className={ausstehend.length > 0 ? 'border-amber-300' : ''}>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-sans text-2xl text-text font-semibold">{ausstehend.length}</p>
              <p className="font-sans text-xs text-muted">Ausstehend</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schnellzugriff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/patienten" className="no-underline">
          <Card className="hover:border-sage transition-colors cursor-pointer h-full">
            <CardContent className="py-6">
              <h3 className="font-serif text-lg text-text mb-1">Patientenverwaltung</h3>
              <p className="font-sans text-sm text-muted">Patienten anzeigen, Dokumente hochladen, Rechnungen anlegen</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/patienten?filter=ausstehend" className="no-underline">
          <Card className="hover:border-sage transition-colors cursor-pointer h-full">
            <CardContent className="py-6">
              <h3 className="font-serif text-lg text-text mb-1">Registrierungsanfragen</h3>
              <p className="font-sans text-sm text-muted">
                Neue Anfragen prüfen und freischalten
                {ausstehend.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-300">
                    {ausstehend.length} neu
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
