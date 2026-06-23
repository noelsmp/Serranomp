import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FolderOpen, User, ShieldCheck,
  LogOut, Heart, Menu, X, ChevronRight, Settings,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { usePatient } from '../hooks/usePatient';
import toast from 'react-hot-toast';

const patientNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Übersicht' },
  { to: '/rechnungen', icon: FileText, label: 'Rechnungen' },
  { to: '/dokumente', icon: FolderOpen, label: 'Dokumente' },
  { to: '/profil', icon: User, label: 'Mein Profil' },
  { to: '/mein-datenschutz', icon: ShieldCheck, label: 'Datenschutz' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { signOut, isAdmin } = useAuth();
  const { patient } = usePatient();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const praxisName = import.meta.env.VITE_PRAXIS_NAME ?? 'Naturheilpraxis';

  async function handleLogout() {
    await signOut();
    toast.success('Sie wurden erfolgreich abgemeldet.');
    navigate('/login', { replace: true });
  }

  const navItems = patientNav;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0 fixed h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <Heart size={18} className="text-white fill-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-green-900 leading-tight truncate">Patientenportal</p>
            <p className="text-xs text-gray-400 truncate">{praxisName}</p>
          </div>
        </div>

        {/* Patient badge */}
        {patient && (
          <div className="mx-3 mt-4 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
            <p className="text-xs text-green-600 font-medium">Angemeldet als</p>
            <p className="text-sm font-semibold text-green-900 mt-0.5 truncate">
              {patient.vorname} {patient.nachname}
            </p>
            <p className="text-xs text-green-500">{patient.patient_nr}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-800',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                )
              }
            >
              <Settings size={18} />
              Administration
            </NavLink>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col md:hidden shadow-xl transition-transform duration-300',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white fill-white" />
            </div>
            <span className="font-bold text-green-900 text-sm">Patientenportal</span>
          </div>
          <button onClick={() => setMenuOpen(false)} className="p-1 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {patient && (
          <div className="mx-3 mt-3 px-4 py-3 bg-green-50 rounded-xl">
            <p className="text-xs text-green-600 font-medium">Angemeldet</p>
            <p className="text-sm font-semibold text-green-900">{patient.vorname} {patient.nachname}</p>
            <p className="text-xs text-green-500">{patient.patient_nr}</p>
          </div>
        )}

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-green-50',
                )
              }
            >
              <Icon size={18} />
              {label}
              <ChevronRight size={14} className="ml-auto opacity-30" />
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

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setMenuOpen(true)} className="p-1.5 text-gray-600 rounded-lg hover:bg-gray-100">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-green-700 fill-green-700" />
            <span className="font-bold text-green-900 text-sm">Patientenportal</span>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-gray-500 rounded-lg hover:bg-gray-100">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
