'use client'

import { useState } from 'react'
import type { Dokument } from '@/lib/db/schema'
import { KATEGORIE_LABELS, KATEGORIE_FARBEN, formatDateigroesse, formatDatumZeit } from '@/types'
import type { DokumentKategorie } from '@/types'
import { Button } from '@/components/ui/Button'
import { Download, Building2, User } from 'lucide-react'
import { clsx } from 'clsx'

interface DokumenteTabelleProps {
  dokumente: Dokument[]
  patientId: string
}

const ALLE_KATEGORIEN: DokumentKategorie[] = ['rechnung', 'anamnesebogen', 'behandlung', 'vorlage', 'sonstiges']

export function DokumenteTabelle({ dokumente }: DokumenteTabelleProps) {
  const [filter, setFilter] = useState<DokumentKategorie | 'alle'>('alle')
  const [ladeend, setLadeend] = useState<string | null>(null)

  const gefiltert = filter === 'alle'
    ? dokumente
    : dokumente.filter(d => d.kategorie === filter)

  async function herunterladen(id: string, name: string) {
    setLadeend(id)
    try {
      const res = await fetch(`/api/download/${id}`)
      if (!res.ok) throw new Error('Fehler')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Datei konnte nicht heruntergeladen werden.')
    } finally {
      setLadeend(null)
    }
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setFilter('alle')}
          className={clsx(
            'px-3 py-1.5 text-sm font-sans rounded-full border transition-colors',
            filter === 'alle'
              ? 'bg-sage text-white border-sage'
              : 'bg-white text-muted border-border hover:border-sage hover:text-sage'
          )}
        >
          Alle ({dokumente.length})
        </button>
        {ALLE_KATEGORIEN.map(kat => {
          const anzahl = dokumente.filter(d => d.kategorie === kat).length
          if (anzahl === 0) return null
          return (
            <button
              key={kat}
              onClick={() => setFilter(kat)}
              className={clsx(
                'px-3 py-1.5 text-sm font-sans rounded-full border transition-colors',
                filter === kat
                  ? 'bg-sage text-white border-sage'
                  : 'bg-white text-muted border-border hover:border-sage hover:text-sage'
              )}
            >
              {KATEGORIE_LABELS[kat]} ({anzahl})
            </button>
          )
        })}
      </div>

      {gefiltert.length === 0 ? (
        <div className="text-center py-12 text-muted font-sans text-sm">
          Keine Dokumente vorhanden.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted font-normal">Dateiname</th>
                <th className="text-left py-3 px-4 text-muted font-normal">Kategorie</th>
                <th className="text-left py-3 px-4 text-muted font-normal hidden md:table-cell">Von</th>
                <th className="text-left py-3 px-4 text-muted font-normal hidden sm:table-cell">Datum</th>
                <th className="text-left py-3 px-4 text-muted font-normal hidden lg:table-cell">Größe</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {gefiltert.map(dok => (
                <tr key={dok.id} className="border-b border-border last:border-0 hover:bg-cream transition-colors">
                  <td className="py-3 px-4 text-text max-w-[200px] truncate">{dok.name}</td>
                  <td className="py-3 px-4">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs border',
                      KATEGORIE_FARBEN[dok.kategorie as DokumentKategorie] ?? 'bg-stone-50 text-stone-700 border-stone-200'
                    )}>
                      {KATEGORIE_LABELS[dok.kategorie as DokumentKategorie] ?? dok.kategorie}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-muted">
                      {dok.hochgeladenVon === 'praxis'
                        ? <><Building2 className="w-3.5 h-3.5 text-sage" /> Praxis</>
                        : <><User className="w-3.5 h-3.5 text-amber-600" /> Patient</>
                      }
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-muted">
                    {formatDatumZeit(dok.erstellt)}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-muted">
                    {formatDateigroesse(dok.dateigroesse)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => herunterladen(dok.id, dok.name)}
                      loading={ladeend === dok.id}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Laden
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
