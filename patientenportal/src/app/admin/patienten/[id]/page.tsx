'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DokumenteTabelle } from '@/components/portal/DokumenteTabelle'
import { UploadModal } from '@/components/portal/UploadModal'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Benutzer, Dokument } from '@/lib/db/schema'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Benutzer | null>(null)
  const [dokumente, setDokumente] = useState<Dokument[]>([])
  const [laden, setLaden] = useState(true)
  const [uploadOffen, setUploadOffen] = useState(false)

  async function laden_() {
    const res = await fetch(`/api/admin/patient/${id}`)
    if (res.ok) {
      const daten = await res.json()
      setPatient(daten.patient)
      setDokumente(daten.dokumente)
    }
    setLaden(false)
  }

  useEffect(() => { laden_() }, [id])

  if (laden) return <div className="py-12 text-center text-muted font-sans">Wird geladen…</div>
  if (!patient) return <div className="py-12 text-center text-muted font-sans">Patient nicht gefunden.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/patienten" className="text-muted hover:text-text no-underline">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl text-text">{patient.vorname} {patient.nachname}</h1>
          <p className="font-sans text-sm text-muted">{patient.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-text">Dokumente ({dokumente.length})</h2>
          <Button size="sm" onClick={() => setUploadOffen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Hochladen
          </Button>
        </CardHeader>
        <CardContent>
          <DokumenteTabelle dokumente={dokumente} patientId={id} />
        </CardContent>
      </Card>

      {uploadOffen && (
        <UploadModal
          patientId={id}
          onErfolg={() => { setUploadOffen(false); laden_() }}
          onAbbrechen={() => setUploadOffen(false)}
        />
      )}
    </div>
  )
}
