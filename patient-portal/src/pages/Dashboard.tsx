import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FolderOpen, CheckCircle, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { usePatient } from '../hooks/usePatient';
import Badge from '../components/ui/Badge';
import type { Rechnung, PortalDokument } from '../types/database';

export default function Dashboard() {
  const { patient } = usePatient();
  const [rechnungen, setRechnungen] = useState<Rechnung[]>([]);
  const [dokumente, setDokumente] = useState<PortalDokument[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!patient) return;
    Promise.all([
      supabase.from('rechnungen').select('*').eq('patient_id', patient.id).order('ausstellungsdatum', { ascending: false }),
      supabase.from('portal_dokumente').select('*').eq('patient_id', patient.id).order('erstellt', { ascending: false }),
    ]).then(([r, d]) => {
      setRechnungen(r.data ?? []);
      setDokumente(d.data ?? []);
      setLaden(false);
    });
  }, [patient]);

  const offeneRechnungen = rechnungen.filter(r => !r.bezahlt);
  const bezahlteRechnungen = rechnungen.filter(r => r.bezahlt);
  const neueDokumente = dokumente.filter(d => d.hochgeladen_von === 'praxis');

  const stunde = new Date().getHours();
  const gruss = stunde < 12 ? 'Guten Morgen' : stunde < 18 ? 'Guten Tag' : 'Guten Abend';

  if (laden) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {gruss}{patient ? `, ${patient.vorname}` : ''}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Willkommen in Ihrem persönlichen Patientenportal.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock size={20} className="text-orange-600" />}
          bg="bg-orange-50"
          label="Offene Rechnungen"
          value={offeneRechnungen.length}
          link="/rechnungen"
        />
        <StatCard
          icon={<CheckCircle size={20} className="text-green-600" />}
          bg="bg-green-50"
          label="Bezahlte Rechnungen"
          value={bezahlteRechnungen.length}
          link="/rechnungen"
        />
        <StatCard
          icon={<FolderOpen size={20} className="text-blue-600" />}
          bg="bg-blue-50"
          label="Dok. von Praxis"
          value={neueDokumente.length}
          link="/dokumente"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-purple-600" />}
          bg="bg-purple-50"
          label="Meine Uploads"
          value={dokumente.filter(d => d.hochgeladen_von === 'patient').length}
          link="/dokumente"
        />
      </div>

      {/* Recent Invoices */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-green-700" />
            Letzte Rechnungen
          </h2>
          <Link to="/rechnungen" className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1">
            Alle anzeigen <ArrowRight size={14} />
          </Link>
        </div>
        {rechnungen.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">Keine Rechnungen vorhanden.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {rechnungen.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.rechnungsnr}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(r.ausstellungsdatum), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {r.gesamtbetrag.toFixed(2).replace('.', ',')} €
                  </span>
                  <Badge
                    label={r.bezahlt ? 'Bezahlt' : 'Offen'}
                    variant={r.bezahlt ? 'green' : 'yellow'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Documents */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FolderOpen size={18} className="text-green-700" />
            Neueste Dokumente
          </h2>
          <Link to="/dokumente" className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1">
            Alle anzeigen <ArrowRight size={14} />
          </Link>
        </div>
        {dokumente.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">Keine Dokumente vorhanden.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {dokumente.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {d.kategorie} · {format(new Date(d.erstellt), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>
                <Badge
                  label={d.hochgeladen_von === 'praxis' ? 'Von Praxis' : 'Mein Upload'}
                  variant={d.hochgeladen_von === 'praxis' ? 'blue' : 'gray'}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon, bg, label, value, link,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-green-200 hover:shadow-sm transition-all group"
    >
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 group-hover:text-green-700 transition-colors">{label}</p>
    </Link>
  );
}
