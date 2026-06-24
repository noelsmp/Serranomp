'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { FileText, Receipt, LayoutDashboard, LogOut, Menu, X, UserCircle } from 'lucide-react'
import { useState } from 'react'

interface NavigationProps {
  vorname: string
  nachname: string
  rolle: string
}

const patientLinks = [
  { href: '/dashboard', label: 'Übersicht', icon: LayoutDashboard },
  { href: '/dokumente', label: 'Dokumente', icon: FileText },
  { href: '/rechnungen', label: 'Rechnungen', icon: Receipt },
  { href: '/profil', label: 'Mein Profil', icon: UserCircle },
]

const adminLinks = [
  { href: '/admin', label: 'Admin-Dashboard', icon: LayoutDashboard },
  { href: '/admin/patienten', label: 'Patienten', icon: FileText },
]

export function Navigation({ vorname, nachname, rolle }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOffen, setMenuOffen] = useState(false)

  const links = rolle === 'admin' ? adminLinks : patientLinks

  async function abmelden() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={rolle === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-serif">N</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-sans text-sage-dk tracking-wide leading-tight">NATURHEILPRAXIS HILFREICH</p>
              <p className="text-xs font-sans text-muted">{rolle === 'admin' ? 'Administration' : 'Mein Bereich'}</p>
            </div>
          </Link>

          {/* Desktop-Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded text-sm font-sans no-underline transition-colors',
                  pathname === href || (href !== '/admin' && href !== '/dashboard' && pathname.startsWith(href))
                    ? 'bg-sage-lt text-sage-dk'
                    : 'text-muted hover:text-text hover:bg-warm'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Nutzerinfo + Abmelden */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-sans text-muted">
              {vorname} {nachname}
            </span>
            <button
              onClick={abmelden}
              className="hidden md:flex items-center gap-1.5 text-sm font-sans text-muted hover:text-text transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </button>
            {/* Hamburger */}
            <button
              className="md:hidden p-2 text-muted"
              onClick={() => setMenuOffen(!menuOffen)}
              aria-label="Navigation öffnen"
            >
              {menuOffen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile-Menü */}
        {menuOffen && (
          <div className="md:hidden border-t border-border py-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOffen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 text-sm font-sans no-underline',
                  pathname === href ? 'text-sage-dk bg-sage-lt' : 'text-text hover:bg-warm'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={abmelden}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-sans text-muted hover:bg-warm"
            >
              <LogOut className="w-4 h-4" />
              Abmelden ({vorname})
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
