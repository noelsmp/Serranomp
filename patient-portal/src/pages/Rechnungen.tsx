import { useEffect, useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { usePatient } from '../hooks/usePatient';
import Badge from '../components/ui/Badge';
import type { Rechnung } from '../types/database';
import toast from 'react-hot-toast';

type Filter = 'alle' | 'offen' | 'bezahlt';

export default function Rechnungen() {
  const { patient } = usePatient();
  const [rechnungen, setRechnungen] = useState<Rechnung[]>([]);
  const [laden, setLaden] = useState(true);
  const [filter, setFilter] = useState<Filter>('alle');
  const [suche, setSuche] = useState('');

  useEffect(() => {
    if (!patient) return;
    supabase
      .from('rechnungen')
      .select('*')
      .eq('patient_id', patient.id)
      .order('ausstellungsdatum', { ascending: false })
      .then(({ data }) => {
        setRechnungen(data ?? []);
        setLaden(false);
      });
  }, [patient]);

  async function downloadPDF(rechnung: Rechnung) {
    if (!rechnung.storage_path) {
      toast.error('Kein PDF für diese Rechnung hinterlegt.');
      return;
    }
    const { data, error } = await supabase.storage
      .from('rechnungen')
      .download(rechnung.storage_path);
    if (error || !data) {
      toast.error('Fehler beim Herunterladen des PDFs.');
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rechnung.rechnungsnr}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('PDF wird heruntergeladen.');
  }

  const gefiltert = rechnungen
    .filter(r => {
      if (filter === 'offen') return !r.bezahlt;
      if (filter === 'bezahlt') return r.bezahlt;
      return true;
    })
    .filter(r =>
      suche === '' ||
      r.rechnungsnr.toLowerCase().includes(suche.toLowerCase()),
    );

  const gesamtOffen = rechnungen
    .filter(r => !r.bezahlt)
    .reduce((s, r) => s + r.gesamtbetrag, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meine Rechnungen</h1>
        <p className="text-gray-500 text-sm mt-1">
          Laden Sie Ihre Rechnungen als PDF herunter.
        </p>
      </div>

      {/* Summary */}
      {gesamtOffen > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-900">Offener Betrag</p>
            <p className="text-lg font-bold text-orange-700">
              {gesamtOffen.toFixed(2).replace('.', ',')} €
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['alle', 'offen', 'bezahlt'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'alle' ? 'Alle' : f === 'offen' ? 'Offen' : 'Bezahlt'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={suche}
            onChange={e => setSuche(e.target.value)}
            placeholder="Rechnungsnr. suchen …"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {laden ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gefiltert.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FileText size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Keine Rechnungen gefunden.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="hidden sm:table w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Rechnungsnr.</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Datum</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Betrag</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gefiltert.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.rechnungsnr}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(r.ausstellungsdatum), 'dd.MM.yyyy', { locale: de })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {r.gesamtbetrag.toFixed(2).replace('.', ',')} €
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        label={r.bezahlt ? 'Bezahlt' : 'Offen'}
                        variant={r.bezahlt ? 'green' : 'yellow'}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.storage_path && (
                        <button
                          onClick={() => downloadPDF(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {gefiltert.map(r => (
                <div key={r.id} className="px-4 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.rechnungsnr}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(r.ausstellungsdatum), 'dd. MMMM yyyy', { locale: de })}
                      </p>
                    </div>
                    <Badge label={r.bezahlt ? 'Bezahlt' : 'Offen'} variant={r.bezahlt ? 'green' : 'yellow'} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">
                      {r.gesamtbetrag.toFixed(2).replace('.', ',')} €
                    </span>
                    {r.storage_path && (
                      <button
                        onClick={() => downloadPDF(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg"
                      >
                        <Download size={13} />
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Heilbehandlungen sind gem. § 4 Nr. 14 UStG von der Umsatzsteuer befreit.
      </p>
    </div>
  );
}
