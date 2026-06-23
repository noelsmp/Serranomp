import { useEffect, useState } from 'react';
import { Users, FileText, FolderOpen, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patienten: 0, rechnungen: 0, dokumente: 0, offenBetrag: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('patienten').select('id', { count: 'exact', head: true }),
      supabase.from('rechnungen').select('id, gesamtbetrag, bezahlt'),
      supabase.from('portal_dokumente').select('id', { count: 'exact', head: true }),
    ]).then(([p, r, d]) => {
      const rechnungen = r.data ?? [];
      const offen = rechnungen.filter(x => !x.bezahlt).reduce((s, x) => s + x.gesamtbetrag, 0);
      setStats({
        patienten: p.count ?? 0,
        rechnungen: rechnungen.length,
        dokumente: d.count ?? 0,
        offenBetrag: offen,
      });
    });
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin-Übersicht</h1>
        <p className="text-gray-500 text-sm mt-1">Verwaltung des Patientenportals</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} className="text-green-600" />} bg="bg-green-50" label="Patienten" value={stats.patienten} />
        <StatCard icon={<FileText size={20} className="text-blue-600" />} bg="bg-blue-50" label="Rechnungen" value={stats.rechnungen} />
        <StatCard icon={<FolderOpen size={20} className="text-purple-600" />} bg="bg-purple-50" label="Dokumente" value={stats.dokumente} />
        <StatCard
          icon={<TrendingUp size={20} className="text-orange-600" />}
          bg="bg-orange-50"
          label="Offener Betrag"
          value={`${stats.offenBetrag.toFixed(2).replace('.', ',')} €`}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="font-semibold text-blue-900 mb-2">Neue Patienten hinzufügen</h2>
        <p className="text-sm text-blue-700">
          Neue Patientenkonten werden über das{' '}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Supabase Dashboard
          </a>{' '}
          unter <strong>Authentication → Users → Invite</strong> angelegt.
          Geben Sie die E-Mail-Adresse des Patienten ein – dieser erhält automatisch
          einen Einladungslink zum Setzen seines Passworts. Anschließend hier unter
          „Patienten" die Stammdaten anlegen.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, bg, label, value }: { icon: React.ReactNode; bg: string; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
