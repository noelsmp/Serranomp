import Link from 'next/link'
import { Shield, FileText, Receipt, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="font-sans text-xs tracking-widest text-sage-dk uppercase">Naturheilpraxis Hilfreich</p>
            <p className="font-sans text-xs text-muted">Sympathikustherapie · Regulationsmedizin · Moers</p>
          </div>
          <a href="https://naturheilpraxis-hilfreich.de" className="font-sans text-xs text-muted hover:text-sage transition-colors">
            ← Zur Praxis-Homepage
          </a>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="font-sans text-xs tracking-widest text-sage uppercase mb-4">Patientenportal</p>
            <h1 className="font-serif text-3xl md:text-4xl text-text leading-tight mb-6">
              Ihr persönlicher Bereich –<br />
              sicher und jederzeit verfügbar
            </h1>
            <p className="text-muted text-lg mb-10">
              Greifen Sie auf Ihre Rechnungen, Behandlungsdokumente und Anamnesebögen zu.
              Alle Daten werden DSGVO-konform auf Servern in Deutschland gespeichert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-sage text-white font-sans text-sm tracking-wide px-6 py-3 rounded hover:bg-sage-dk transition-colors no-underline"
              >
                Anmelden
              </Link>
              <Link
                href="/registrierung"
                className="inline-flex items-center justify-center border border-sage text-sage font-sans text-sm tracking-wide px-6 py-3 rounded hover:bg-sage-lt transition-colors no-underline"
              >
                Registrieren
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-warm border-t border-border py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-serif text-2xl text-text mb-10 text-center">Was Sie im Portal erwartet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Receipt,
                  titel: 'Rechnungen',
                  text: 'Laden Sie Ihre Rechnungen jederzeit als PDF herunter.',
                },
                {
                  icon: FileText,
                  titel: 'Anamnesebögen',
                  text: 'Füllen Sie Anamnesebögen digital aus und senden Sie diese sicher an die Praxis.',
                },
                {
                  icon: FileText,
                  titel: 'Dokumente',
                  text: 'Befunde und Behandlungsdokumentation – immer griffbereit.',
                },
                {
                  icon: Lock,
                  titel: 'Datenschutz',
                  text: 'Ihre Gesundheitsdaten werden DSGVO-konform in Deutschland gespeichert.',
                },
              ].map(({ icon: Icon, titel, text }) => (
                <div key={titel} className="bg-white border border-border rounded-lg p-6">
                  <div className="w-10 h-10 bg-sage-lt rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-sage" />
                  </div>
                  <h3 className="font-serif text-text text-lg mb-2">{titel}</h3>
                  <p className="font-sans text-sm text-muted leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DSGVO-Hinweis */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-start gap-4 bg-sage-lt border border-sage/20 rounded-lg p-6">
            <Shield className="w-6 h-6 text-sage flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-text mb-1">Datenschutz & Sicherheit</h3>
              <p className="font-sans text-sm text-muted">
                Alle Daten werden ausschließlich auf Servern in Deutschland gespeichert. Der Zugriff erfolgt
                ausschließlich über verschlüsselte Verbindungen (HTTPS). Weitere Informationen finden Sie in unserer{' '}
                <a href="https://naturheilpraxis-hilfreich.de/datenschutz" className="text-sage hover:underline">
                  Datenschutzerklärung
                </a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-warm py-8">
        <div className="max-w-5xl mx-auto px-4 text-center font-sans text-xs text-muted">
          <p>© {new Date().getFullYear()} Naturheilpraxis Hilfreich · Moers</p>
          <p className="mt-1">
            <a href="https://naturheilpraxis-hilfreich.de/datenschutz" className="hover:text-sage">Datenschutz</a>
            {' · '}
            <a href="https://naturheilpraxis-hilfreich.de/impressum" className="hover:text-sage">Impressum</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
