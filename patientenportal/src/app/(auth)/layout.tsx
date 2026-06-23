export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-border py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="no-underline">
            <p className="font-sans text-xs tracking-widest text-sage-dk uppercase">Naturheilpraxis Hilfreich</p>
            <p className="font-sans text-xs text-muted">Patientenportal</p>
          </a>
          <a href="https://naturheilpraxis-hilfreich.de" className="font-sans text-xs text-muted hover:text-sage transition-colors">
            ← Zur Praxis-Homepage
          </a>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="py-6 text-center font-sans text-xs text-muted border-t border-border">
        <a href="https://naturheilpraxis-hilfreich.de/datenschutz" className="hover:text-sage">Datenschutz</a>
        {' · '}
        <a href="https://naturheilpraxis-hilfreich.de/impressum" className="hover:text-sage">Impressum</a>
      </footer>
    </div>
  )
}
