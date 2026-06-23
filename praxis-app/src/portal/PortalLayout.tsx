import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FolderOpen, ShieldCheck,
  LogOut, Heart, Menu, X, ChevronRight,
} from 'lucide-react';
import { clearPortalSession, usePortalSession } from './portalAuth';
import { clsx } from 'clsx';

const navItems = [
  { to: '/portal/dashboard', icon: LayoutDashboard, label: 'Übersicht' },
  { to: '/portal/rechnungen', icon: FileText, label: 'Rechnungen' },
  { to: '/portal/dokumente', icon: FolderOpen, label: 'Dokumente' },
  { to: '/portal/datenschutz', icon: ShieldCheck, label: 'Datenschutz' },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const session = usePortalSession();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    clearPortalSession();
    navigate('/portal/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
            <Heart size={18} className="text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-800 leading-tight">Patientenportal</p>
            <p className="text-xs text-gray-400">Naturheilpraxis</p>
          </div>
        </div>

        {/* Patient info */}
        {session && (
          <div className="px-4 py-4 mx-3 mt-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-xs text-green-600 font-medium">Angemeldet als</p>
            <p className="text-sm font-semibold text-green-900 mt-0.5">
              {session.vorname} {session.nachname}
            </p>
            <p className="text-xs text-green-600">{session.patientNr}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-800',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col md:hidden transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white fill-white" />
            </div>
            <span className="font-bold text-green-800">Patientenportal</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-500">
            <X size={20} />
          </button>
        </div>
        {session && (
          <div className="px-4 py-3 mx-3 mt-3 bg-green-50 rounded-xl">
            <p className="text-xs text-green-600 font-medium">Angemeldet</p>
            <p className="text-sm font-semibold text-green-900">{session.vorname} {session.nachname}</p>
            <p className="text-xs text-green-600">{session.patientNr}</p>
          </div>
        )}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-green-50',
                )
              }
            >
              <Icon size={18} />
              {label}
              <ChevronRight size={14} className="ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 text-gray-600">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-green-700 fill-green-700" />
            <span className="font-bold text-green-800 text-sm">Patientenportal</span>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-gray-500">
            <LogOut size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
