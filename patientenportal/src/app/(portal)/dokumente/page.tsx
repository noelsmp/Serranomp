'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DokumenteTabelle } from '@/components/portal/DokumenteTabelle'
import { UploadModal } from '@/components/portal/UploadModal'
import { Plus } from 'lucide-react'
import type { Dokument } from '@/lib/db/schema'

export default function DokumentePage() {
  const [dokumente, setDokumente] = useState<Dokument[]>([])
  const [patientId, setPatientId] = useState('')
  const [laden, setLaden] = useState(true)
  const [uploadOffen, setUploadOffen] = useState(false)

  async function laden_() {
    const res = await fetch('/api/meine-dokumente')
    if (res.ok) {
      const daten = await res.json()
      setDokumente(daten.dokumente)
      setPatientId(daten.patientId)
    }
    setLaden(false)
  }

  useEffect(() => { laden_() }, [])

  function nachUpload() {
    setUploadOffen(false)
    laden_()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-text">Meine Dokumente</h1>
          <p className="font-sans text-sm text-muted mt-1">Rechnungen, Befunde und Ihre hochgeladenen Unterlagen</p>
        </div>
        <Button onClick={() => setUploadOffen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Hochladen
        </Button>
      </div>

      <Card>
        <CardContent>
          {laden ? (
            <div className="py-12 text-center text-muted font-sans text-sm">Wird geladen…</div>
          ) : (
            <DokumenteTabelle dokumente={dokumente} patientId={patientId} />
          )}
        </CardContent>
      </Card>

      {uploadOffen && (
        <UploadModal
          patientId={patientId}
          onErfolg={nachUpload}
          onAbbrechen={() => setUploadOffen(false)}
        />
      )}
    </div>
  )
}
