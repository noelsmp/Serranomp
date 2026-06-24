'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState('')
  const [laden, setLaden] = useState(false)
  const [gesendet, setGesendet] = useState(false)

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setLaden(true)
    try {
      await fetch('/api/passwort-vergessen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setGesendet(true)
    } finally {
      setLaden(false)
    }
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
              <div className="bg-green-50 border border-green-200 text-green-800 rounded px-4 py-3 text-sm font-sans">
                Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen des Passworts gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.
              </div>
              <p className="font-sans text-sm text-muted text-center">Der Link ist 1 Stunde gültig.</p>
            </div>
          ) : (
            <form onSubmit={absenden} className="space-y-4">
              <Input
                label="E-Mail-Adresse"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="ihre@email.de"
              />
              <Button type="submit" className="w-full" loading={laden} size="lg">
                Link anfordern
              </Button>
            </form>
          )}
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
