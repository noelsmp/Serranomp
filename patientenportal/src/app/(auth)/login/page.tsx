'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function LoginFormular() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const passwortGeaendert = searchParams.get('passwort-geaendert') === '1'

  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')

  async function anmelden(e: React.FormEvent) {
    e.preventDefault()
    setFehler('')
    setLaden(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passwort }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFehler(data.error ?? 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } finally {
      setLaden(false)
    }
  }

  return (
    <>
      {passwortGeaendert && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded px-4 py-3 text-sm font-sans mx-6 mt-4">
          Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt anmelden.
        </div>
      )}

      <form onSubmit={anmelden} className="px-6 py-6 space-y-4">
        <Input
          label="E-Mail-Adresse"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="ihre@email.de"
        />
        <div>
          <Input
            label="Passwort"
            type="password"
            value={passwort}
            onChange={e => setPasswort(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="mt-1 text-right">
            <Link href="/passwort-vergessen" className="font-sans text-xs text-muted hover:text-sage">
              Passwort vergessen?
            </Link>
          </div>
        </div>

        {fehler && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm font-sans">
            {fehler}
          </div>
        )}

        <Button type="submit" className="w-full" loading={laden} size="lg">
          Anmelden
        </Button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-sage-dk px-6 py-6">
          <h1 className="font-serif text-xl text-white">Patientenportal</h1>
          <p className="font-sans text-sm text-sage-lt mt-1">Bitte melden Sie sich mit Ihren Zugangsdaten an.</p>
        </div>

        <Suspense fallback={<div className="px-6 py-6 font-sans text-sm text-muted">Lädt …</div>}>
          <LoginFormular />
        </Suspense>

        <div className="px-6 py-4 bg-warm border-t border-border text-center">
          <p className="font-sans text-sm text-muted">
            Noch kein Konto?{' '}
            <Link href="/registrierung" className="text-sage hover:text-sage-dk">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-center font-sans text-xs text-muted">
        Der Zugang ist ausschließlich für Patientinnen und Patienten<br />
        der Naturheilpraxis Hilfreich.
      </p>
    </div>
  )
}
