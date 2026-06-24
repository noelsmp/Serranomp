'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function PasswortNeuSetzenFormular() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [neuesPasswort, setNeuesPasswort] = useState('')
  const [wiederholung, setWiederholung] = useState('')
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setFehler('')
    setLaden(true)

    try {
      const res = await fetch('/api/passwort-neu-setzen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, neuesPasswort, neuesPasswortWiederholung: wiederholung }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFehler(data.error ?? 'Ein Fehler ist aufgetreten.')
        return
      }

      router.push('/login?passwort-geaendert=1')
    } finally {
      setLaden(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm font-sans">
        Ungültiger Link. Bitte fordern Sie einen neuen Link an.
      </div>
    )
  }

  return (
    <form onSubmit={absenden} className="space-y-4">
      <Input
        label="Neues Passwort"
        type="password"
        value={neuesPasswort}
        onChange={e => setNeuesPasswort(e.target.value)}
        required
        autoComplete="new-password"
      />
      <Input
        label="Passwort wiederholen"
        type="password"
        value={wiederholung}
        onChange={e => setWiederholung(e.target.value)}
        required
        autoComplete="new-password"
      />
      <p className="font-sans text-xs text-muted">Mindestens 8 Zeichen, 1 Großbuchstabe, 1 Zahl.</p>

      {fehler && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm font-sans">
          {fehler}
        </div>
      )}

      <Button type="submit" className="w-full" loading={laden} size="lg">
        Passwort speichern
      </Button>
    </form>
  )
}

export default function PasswortNeuSetzenPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-sage-dk px-6 py-6">
          <h1 className="font-serif text-xl text-white">Neues Passwort vergeben</h1>
          <p className="font-sans text-sm text-sage-lt mt-1">Bitte wählen Sie ein sicheres Passwort.</p>
        </div>

        <div className="px-6 py-6">
          <Suspense fallback={<div className="font-sans text-sm text-muted">Lädt …</div>}>
            <PasswortNeuSetzenFormular />
          </Suspense>
        </div>

        <div className="px-6 py-4 bg-warm border-t border-border text-center">
          <Link href="/login" className="font-sans text-sm text-sage hover:text-sage-dk">
            Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  )
}
