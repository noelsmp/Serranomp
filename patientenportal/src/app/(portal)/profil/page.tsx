'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { KeyRound, CheckCircle } from 'lucide-react'

export default function ProfilPage() {
  const [altesPasswort, setAltesPasswort] = useState('')
  const [neuesPasswort, setNeuesPasswort] = useState('')
  const [wiederholung, setWiederholung] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [erfolg, setErfolg] = useState(false)
  const [laden, setLaden] = useState(false)

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setFehler(null)
    setErfolg(false)
    setLaden(true)

    const res = await fetch('/api/passwort-aendern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        altesPasswort,
        neuesPasswort,
        neuesPasswortWiederholung: wiederholung,
      }),
    })

    const data = await res.json()
    setLaden(false)

    if (!res.ok) {
      setFehler(data.error ?? 'Ein Fehler ist aufgetreten.')
      return
    }

    setErfolg(true)
    setAltesPasswort('')
    setNeuesPasswort('')
    setWiederholung('')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-text">Mein Profil</h1>
        <p className="font-sans text-sm text-muted mt-1">Verwalten Sie Ihre Zugangsdaten</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-sage" />
            <h2 className="font-serif text-lg text-text">Passwort ändern</h2>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {erfolg && (
            <div className="flex items-center gap-2 bg-sage-lt text-sage-dk font-sans text-sm px-4 py-3 rounded mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Ihr Passwort wurde erfolgreich geändert.
            </div>
          )}

          {fehler && (
            <div className="bg-red-50 text-red-700 font-sans text-sm px-4 py-3 rounded mb-4">
              {fehler}
            </div>
          )}

          <form onSubmit={absenden} className="space-y-4">
            <div>
              <label className="block font-sans text-xs text-muted uppercase tracking-wide mb-1">
                Aktuelles Passwort
              </label>
              <input
                type="password"
                value={altesPasswort}
                onChange={e => setAltesPasswort(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-border rounded px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-sage"
              />
            </div>

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
              {laden ? 'Wird gespeichert…' : 'Passwort ändern'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
