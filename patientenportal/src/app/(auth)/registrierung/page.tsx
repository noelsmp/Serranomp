'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function RegistrierungPage() {
  const [schritt, setSchritt] = useState<'formular' | 'bestaetigung'>('formular')
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')

  const [formular, setFormular] = useState({
    vorname: '',
    nachname: '',
    email: '',
    geburtsdatum: '',
    telefon: '',
    datenschutz: false,
    nutzungsbedingungen: false,
  })

  function feld(name: keyof typeof formular) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setFormular(prev => ({ ...prev, [name]: value }))
    }
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setFehler('')

    if (!formular.datenschutz || !formular.nutzungsbedingungen) {
      setFehler('Bitte stimmen Sie der Datenschutzerklärung und den Nutzungsbedingungen zu.')
      return
    }

    setLaden(true)
    try {
      const res = await fetch('/api/registrierung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: formular.vorname.trim(),
          nachname: formular.nachname.trim(),
          email: formular.email.trim().toLowerCase(),
          geburtsdatum: formular.geburtsdatum,
          telefon: formular.telefon.trim(),
        }),
      })

      const daten = await res.json()

      if (!res.ok) {
        setFehler(daten.error ?? 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return
      }

      setSchritt('bestaetigung')
    } catch {
      setFehler('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setLaden(false)
    }
  }

  if (schritt === 'bestaetigung') {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white border border-border rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-sage-lt rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-sage" />
            </div>
          </div>
          <h1 className="font-serif text-xl text-text mb-3">Registrierung eingegangen</h1>
          <p className="font-sans text-sm text-muted mb-6">
            Ihre Registrierungsanfrage wurde übermittelt und wird von der Praxis geprüft.
            Sie erhalten eine E-Mail, sobald Ihr Zugang freigeschaltet wurde.
          </p>
          <p className="font-sans text-xs text-muted border-t border-border pt-4">
            Bei Fragen wenden Sie sich direkt an die Praxis:<br />
            <a href="mailto:info@naturheilpraxis-hilfreich.de" className="text-sage">info@naturheilpraxis-hilfreich.de</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-sage-dk px-6 py-6">
          <h1 className="font-serif text-xl text-white">Registrierung</h1>
          <p className="font-sans text-sm text-sage-lt mt-1">
            Nach Ihrer Registrierung prüft die Praxis Ihren Antrag und schaltet Ihren Zugang frei.
          </p>
        </div>

        <form onSubmit={absenden} className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vorname"
              value={formular.vorname}
              onChange={feld('vorname')}
              required
              autoComplete="given-name"
            />
            <Input
              label="Nachname"
              value={formular.nachname}
              onChange={feld('nachname')}
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            label="E-Mail-Adresse"
            type="email"
            value={formular.email}
            onChange={feld('email')}
            required
            autoComplete="email"
            placeholder="ihre@email.de"
          />

          <Input
            label="Geburtsdatum"
            type="date"
            value={formular.geburtsdatum}
            onChange={feld('geburtsdatum')}
            required
            max={new Date().toISOString().split('T')[0]}
          />

          <Input
            label="Telefonnummer"
            type="tel"
            value={formular.telefon}
            onChange={feld('telefon')}
            required
            autoComplete="tel"
            placeholder="z.B. 02841 12345"
          />

          {/* Einwilligungen */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formular.datenschutz}
                onChange={feld('datenschutz')}
                className="mt-0.5 w-4 h-4 accent-sage flex-shrink-0"
                required
              />
              <span className="font-sans text-sm text-text">
                Ich habe die{' '}
                <a href="https://naturheilpraxis-hilfreich.de/datenschutz" target="_blank" rel="noreferrer" className="text-sage hover:underline">
                  Datenschutzerklärung
                </a>{' '}
                gelesen und stimme der Verarbeitung meiner personenbezogenen Daten zu. <span className="text-red-600">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formular.nutzungsbedingungen}
                onChange={feld('nutzungsbedingungen')}
                className="mt-0.5 w-4 h-4 accent-sage flex-shrink-0"
                required
              />
              <span className="font-sans text-sm text-text">
                Ich akzeptiere die{' '}
                <a href="https://naturheilpraxis-hilfreich.de/nutzungsbedingungen" target="_blank" rel="noreferrer" className="text-sage hover:underline">
                  Nutzungsbedingungen
                </a>{' '}
                des Patientenportals. <span className="text-red-600">*</span>
              </span>
            </label>
          </div>

          {fehler && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm font-sans">
              {fehler}
            </div>
          )}

          <Button type="submit" className="w-full" loading={laden} size="lg">
            Registrierung absenden
          </Button>
        </form>

        <div className="px-6 py-4 bg-warm border-t border-border text-center">
          <p className="font-sans text-sm text-muted">
            Bereits registriert?{' '}
            <Link href="/login" className="text-sage hover:text-sage-dk">Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
