'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PasswortNeuSetzenForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [neuesPasswort, setNeuesPasswort] = useState('')
  const [wiederholung, setWiederholung] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [laden, setLaden] = useState(false)

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-sm px-4 py-3 rounded">
        Ungültiger Link. Bitte fordern Sie einen neuen an.
      </div>
    )
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setFehler(null)
    setLaden(true)

    const res = await fetch('/api/passwort-neu-setzen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, neuesPasswort, neuesPasswortWiederholung: wiederholung }),
    })

    const data = await res.json()
    setLaden(false)

    if (!res.ok) {
      setFehler(data.error ?? 'Ein Fehler ist aufgetreten.')
      return
    }

    router.push('/login?passwort-geaendert=1')
  }

  return (
    <form onSubmit={absenden} className="space-y-4">
      {fehler && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-sm px-4 py-3 rounded">
          {fehler}
        </div>
      )}
      <div>
        <label className="block font-sans text-xs text-muted uppercase tracking-wide mb-1">
          Neues Passwort
        </label>
        <input
          type="password"
          value={neuesPasswort}
          onChange={e => setNeuesPasswort(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full border border-border rounded px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-sage"
        />
        <p className="font-sans text-xs text-muted mt-1">Mindestens 8 Zeichen, ein Großbuchstabe und eine Zahl.</p>
      </div>
      <div>
        <label className="block font-sans text-xs text-muted uppercase tracking-wide mb-1">
          Neues Passwort wiederholen
        </label>
        <input
          type="password"
          value={wiederholung}
          onChange={e => setWiederholung(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full border border-border rounded px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-sage"
        />
      </div>
      <button
        type="submit"
        disabled={laden}
        className="w-full bg-sage text-white font-sans text-sm py-2.5 rounded hover:bg-sage-dk transition-colors disabled:opacity-50"
      >
        {laden ? 'Wird gespeichert…' : 'Passwort speichern'}
      </button>
    </form>
  )
}

export default function PasswortNeuSetzenPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-sage-dk px-6 py-6">
          <h1 className="font-serif text-xl text-white">Neues Passwort vergeben</h1>
          <p className="font-sans text-sm text-sage-lt mt-1">Bitte wählen Sie ein sicheres neues Passwort.</p>
        </div>
        <div className="px-6 py-6">
          <Suspense>
            <PasswortNeuSetzenForm />
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
