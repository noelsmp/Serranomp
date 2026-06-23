import { db } from '@/lib/db'
import { benutzer, dokumente, rechnungen, registrierungen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDatum, formatDatumZeit } from '@/types'

export default async function PatientenPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const alleRegistrierungen = await db.select().from(registrierungen)
  const allePatienten = await db.select().from(benutzer).where(eq(benutzer.rolle, 'patient'))
  const alleDokumente = await db.select({ patientId: dokumente.patientId }).from(dokumente)
  const ausstehend = alleRegistrierungen.filter(r => r.status === 'ausstehend')

  const zeigeAusstehend = filter === 'ausstehend' || filter === undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-text">Patienten</h1>
        <p className="font-sans text-sm text-muted mt-1">Übersicht aller registrierten Patienten</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <Link
          href="/admin/patienten"
          className={`px-4 py-2.5 font-sans text-sm no-underline border-b-2 transition-colors ${
            !filter || filter !== 'ausstehend'
              ? 'border-sage text-sage'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          Aktive Patienten ({allePatienten.length})
        </Link>
        <Link
          href="/admin/patienten?filter=ausstehend"
          className={`px-4 py-2.5 font-sans text-sm no-underline border-b-2 transition-colors flex items-center gap-1.5 ${
            filter === 'ausstehend'
              ? 'border-sage text-sage'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Clock className="w-4 h-4" />
          Ausstehend ({ausstehend.length})
          {ausstehend.length > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {ausstehend.length}
            </span>
          )}
        </Link>
      </div>

      {/* Ausstehende Registrierungen */}
      {filter === 'ausstehend' && (
        <Card>
          <CardContent className="pt-4">
            {ausstehend.length === 0 ? (
              <p className="font-sans text-sm text-muted py-6 text-center">Keine ausstehenden Anfragen.</p>
            ) : (
              <div className="space-y-3">
                {ausstehend.map(reg => (
                  <div key={reg.id} className="border border-amber-200 rounded-lg p-4 flex items-center justify-between gap-4 bg-amber-50">
                    <div>
                      <p className="font-sans text-sm font-semibold">{reg.vorname} {reg.nachname}</p>
                      <p className="font-sans text-xs text-muted">{reg.email}</p>
                      <p className="font-sans text-xs text-muted">
                        Geb.: {formatDatum(reg.geburtsdatum)} · Tel.: {reg.telefon}
                      </p>
                      <p className="font-sans text-xs text-muted">Eingegangen: {formatDatumZeit(reg.erstellt)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={`/api/freischaltung?token=${reg.token}&aktion=freischalten`}
                        className="inline-flex items-center bg-sage text-white font-sans text-xs px-3 py-1.5 rounded hover:bg-sage-dk no-underline"
                      >
                        Freischalten
                      </a>
                      <a
                        href={`/api/freischaltung?token=${reg.token}&aktion=ablehnen`}
                        className="inline-flex items-center bg-red-700 text-white font-sans text-xs px-3 py-1.5 rounded hover:bg-red-800 no-underline"
                      >
                        Ablehnen
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Patientenliste */}
      {(!filter || filter !== 'ausstehend') && (
        <Card>
          <CardContent className="pt-2">
            {allePatienten.length === 0 ? (
              <p className="font-sans text-sm text-muted py-8 text-center">Noch keine Patienten registriert.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted font-normal">Patient</th>
                      <th className="text-left py-3 px-4 text-muted font-normal hidden md:table-cell">E-Mail</th>
                      <th className="text-left py-3 px-4 text-muted font-normal hidden lg:table-cell">Registriert</th>
                      <th className="text-left py-3 px-4 text-muted font-normal">Status</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allePatienten.map(p => {
                      const anzahlDok = alleDokumente.filter(d => d.patientId === p.id).length
                      return (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-cream">
                          <td className="py-3 px-4">
                            <p className="text-text font-medium">{p.vorname} {p.nachname}</p>
                            {p.geburtsdatum && (
                              <p className="text-xs text-muted">{formatDatum(p.geburtsdatum)}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted hidden md:table-cell">{p.email}</td>
                          <td className="py-3 px-4 text-muted hidden lg:table-cell">{formatDatum(p.erstellt)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={p.status === 'aktiv' ? 'success' : 'danger'}>
                              {p.status === 'aktiv' ? 'Aktiv' : 'Gesperrt'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/admin/patienten/${p.id}`}
                              className="text-xs text-sage hover:text-sage-dk no-underline"
                            >
                              {anzahlDok} Dok. · Öffnen →
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
