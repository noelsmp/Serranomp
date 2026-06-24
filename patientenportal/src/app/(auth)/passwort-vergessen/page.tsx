'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState('')
  const [gesendet, setGesendet] = useState(false)
  const [laden, setLaden] = useState(false)

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setLaden(true)
    await fetch('/api/passwort-vergessen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLaden(false)
    setGesendet(true)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-sage-dk px-6 py-6">
          <h1 className="font-serif text-xl text-white">Passwort vergessen</h1>
          <p className="font-sans text-sm text-sage-lt mt-1">Wir senden Ihnen einen Link zum Zurücksetzen.</p>
        </div>

        <div className="px-6 py-6">
          {gesendet ? (
            <div className="space-y-4">
              <div className="bg-sage-lt border border-sage rounded px-4 py-4 font-sans text-sm text-sage-dk">
                <p className="font-semibold mb-1">E-Mail versendet</p>
                <p>Falls diese E-Mail-Adresse bei uns registriert ist, haben wir einen Link zum Zurücksetzen des Passworts gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.</p>
              </div>
              <p className="text-center font-sans text-sm text-muted">
                <Link href="/login" className="text-sage hover:text-sage-dk">Zurück zur Anmeldung</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={absenden} className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-muted uppercase tracking-wide mb-1">
                  Ihre E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="ihre@email.de"
                  className="w-full border border-border rounded px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-sage"
                />
              </div>
              <button
                type="submit"
                disabled={laden}
                className="w-full bg-sage text-white font-sans text-sm py-2.5 rounded hover:bg-sage-dk transition-colors disabled:opacity-50"
              >
                {laden ? 'Wird gesendet…' : 'Link senden'}
              </button>
              <p className="text-center font-sans text-sm text-muted">
                <Link href="/login" className="text-sage hover:text-sage-dk">Zurück zur Anmeldung</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
