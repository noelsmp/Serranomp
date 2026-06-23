'use client'

import { useState, useRef } from 'react'
import type { DokumentKategorie } from '@/types'
import { KATEGORIE_LABELS } from '@/types'
import { Button } from '@/components/ui/Button'
import { Upload, X, FileText } from 'lucide-react'

interface UploadModalProps {
  patientId: string
  onErfolg: () => void
  onAbbrechen: () => void
}

const ERLAUBTE_TYPEN = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_GROESSE_MB = 10

export function UploadModal({ patientId, onErfolg, onAbbrechen }: UploadModalProps) {
  const [datei, setDatei] = useState<File | null>(null)
  const [kategorie, setKategorie] = useState<DokumentKategorie>('sonstiges')
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function dateiAuswaehlen(e: React.ChangeEvent<HTMLInputElement>) {
    setFehler('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!ERLAUBTE_TYPEN.includes(file.type)) {
      setFehler('Nur PDF, JPEG und PNG Dateien sind erlaubt.')
      return
    }

    if (file.size > MAX_GROESSE_MB * 1024 * 1024) {
      setFehler(`Datei darf maximal ${MAX_GROESSE_MB} MB groß sein.`)
      return
    }

    setDatei(file)
  }

  async function hochladen() {
    if (!datei) return
    setLaden(true)
    setFehler('')

    try {
      const formData = new FormData()
      formData.append('datei', datei)
      formData.append('kategorie', kategorie)
      formData.append('patientId', patientId)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const daten = await res.json()

      if (!res.ok) {
        setFehler(daten.error ?? 'Hochladen fehlgeschlagen.')
        return
      }

      onErfolg()
    } catch {
      setFehler('Hochladen fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg border border-border max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg text-text">Dokument hochladen</h2>
          <button onClick={onAbbrechen} className="text-muted hover:text-text" aria-label="Schließen">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1">
            <label htmlFor="kategorie" className="text-sm font-sans text-text">
              Kategorie <span className="text-red-600">*</span>
            </label>
            <select
              id="kategorie"
              value={kategorie}
              onChange={e => setKategorie(e.target.value as DokumentKategorie)}
              className="w-full rounded border border-border px-3 py-2 text-sm font-sans text-text bg-white focus:outline-none focus:ring-2 focus:ring-sage"
            >
              {(Object.entries(KATEGORIE_LABELS) as [DokumentKategorie, string][]).map(([wert, label]) => (
                <option key={wert} value={wert}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={dateiAuswaehlen}
              className="sr-only"
              id="datei-upload"
            />
            <label
              htmlFor="datei-upload"
              className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-lg px-6 py-8 cursor-pointer hover:border-sage hover:bg-sage-lt transition-colors"
            >
              {datei ? (
                <>
                  <FileText className="w-8 h-8 text-sage" />
                  <span className="text-sm font-sans text-text text-center">{datei.name}</span>
                  <span className="text-xs text-muted">{(datei.size / 1024 / 1024).toFixed(2)} MB</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted" />
                  <span className="text-sm font-sans text-muted text-center">
                    Klicken zum Auswählen<br />
                    <span className="text-xs">PDF, JPEG, PNG – max. {MAX_GROESSE_MB} MB</span>
                  </span>
                </>
              )}
            </label>
          </div>

          {fehler && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{fehler}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
          <Button variant="secondary" onClick={onAbbrechen} disabled={laden}>Abbrechen</Button>
          <Button onClick={hochladen} disabled={!datei || laden} loading={laden}>
            Hochladen
          </Button>
        </div>
      </div>
    </div>
  )
}
