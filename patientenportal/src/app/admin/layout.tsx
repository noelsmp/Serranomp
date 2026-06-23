import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { Navigation } from '@/components/portal/Navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const nutzer = await getSession()

  if (!nutzer) redirect('/login')
  if (nutzer.rolle !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navigation vorname={nutzer.vorname} nachname={nutzer.nachname} rolle="admin" />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center font-sans text-xs text-muted">
        <a href="https://naturheilpraxis-hilfreich.de/datenschutz" className="hover:text-sage">Datenschutz</a>
        {' · '}
        <a href="https://naturheilpraxis-hilfreich.de/impressum" className="hover:text-sage">Impressum</a>
      </footer>
    </div>
  )
}
