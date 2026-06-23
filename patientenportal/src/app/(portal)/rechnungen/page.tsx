import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { rechnungen, dokumente } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Receipt, Download } from 'lucide-react'
import { formatDatum } from '@/types'

export default async function RechnungenPage() {
  const nutzer = await getSession()
  if (!nutzer) return null

  const meineRechnungen = await db
    .select()
    .from(rechnungen)
    .where(eq(rechnungen.patientId, nutzer.id))
    .orderBy(desc(rechnungen.ausstellungsdatum))

  const gesamtOffen = meineRechnungen
    .filter(r => !r.bezahlt)
    .reduce((sum, r) => sum + r.gesamtbetrag, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-text">Meine Rechnungen</h1>
        <p className="font-sans text-sm text-muted mt-1">Alle Rechnungen der Naturheilpraxis Hilfreich</p>
      </div>

      {gesamtOffen > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-sans text-sm font-semibold text-amber-900">Offener Betrag</p>
              <p className="font-sans text-xs text-amber-700">Bitte überweisen Sie den ausstehenden Betrag</p>
            </div>
          </div>
          <p className="font-serif text-xl text-amber-900">
            {gesamtOffen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-serif text-lg text-text">Rechnungsübersicht</h2>
        </CardHeader>
        <CardContent className="pt-0">
          {meineRechnungen.length === 0 ? (
            <p className="font-sans text-sm text-muted py-8 text-center">Noch keine Rechnungen vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted font-normal">Rechnungsnr.</th>
                    <th className="text-left py-3 px-4 text-muted font-normal hidden sm:table-cell">Datum</th>
                    <th className="text-left py-3 px-4 text-muted font-normal hidden md:table-cell">Fällig am</th>
                    <th className="text-right py-3 px-4 text-muted font-normal">Betrag</th>
                    <th className="text-left py-3 px-4 text-muted font-normal">Status</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {meineRechnungen.map(r => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-cream transition-colors">
                      <td className="py-3 px-4 text-text font-medium">{r.rechnungsnr}</td>
                      <td className="py-3 px-4 text-muted hidden sm:table-cell">{formatDatum(r.ausstellungsdatum)}</td>
                      <td className="py-3 px-4 text-muted hidden md:table-cell">{formatDatum(r.faelligkeitsdatum)}</td>
                      <td className="py-3 px-4 text-right text-text">
                        {r.gesamtbetrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="py-3 px-4">
                        {r.bezahlt
                          ? <Badge variant="success">Bezahlt</Badge>
                          : <Badge variant="warning">Offen</Badge>
                        }
                      </td>
                      <td className="py-3 px-4 text-right">
                        {r.dokumentId && (
                          <a
                            href={`/api/download/${r.dokumentId}`}
                            className="inline-flex items-center gap-1 text-xs text-sage hover:text-sage-dk no-underline"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
