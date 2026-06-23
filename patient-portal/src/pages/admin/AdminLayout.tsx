import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, FileText, FolderOpen, LogOut, Settings2, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const nav = [
  { to: '/admin', icon: Settings2, label: 'Admin-Übersicht', end: true },
  { to: '/admin/patienten', icon: Users, label: 'Patienten' },
  { to: '/admin/rechnungen', icon: FileText, label: 'Rechnungen' },
  { to: '/admin/dokumente', icon: FolderOpen, label: 'Dokumente' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    toast.success('Abgemeldet.');
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside className="w-60 bg-gray-950 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Administration</p>
          <p className="text-sm font-semibold text-white mt-0.5">Patientenportal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive ? 'bg-green-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-800 hover:text-white transition-colors mt-4"
          >
            <ArrowLeft size={17} />
            Zum Portal
          </NavLink>
        </nav>
        <div className="px-3 pb-5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={17} />
            Abmelden
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">{children}</main>
    </div>
  );
}
