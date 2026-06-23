import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Upload, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import type { Patient, Rechnung } from '../../types/database';
import toast from 'react-hot-toast';

interface RechnungMitPatient extends Rechnung {
  patient_name?: string;
}

export default function AdminRechnungen() {
  const [patienten, setPatienten] = useState<Pick<Patient, 'id' | 'vorname' | 'nachname' | 'patient_nr'>[]>([]);
  const [rechnungen, setRechnungen] = useState<RechnungMitPatient[]>([]);
  const [laden, setLaden] = useState(true);
  const [neuOffen, setNeuOffen] = useState(false);

  const [patientId, setPatientId] = useState('');
  const [rechnungsnr, setRechnungsnr] = useState('');
  const [ausstellungsdatum, setAusstellungsdatum] = useState(new Date().toISOString().split('T')[0]);
  const [faelligkeitsdatum, setFaelligkeitsdatum] = useState('');
  const [gesamtbetrag, setGesamtbetrag] = useState('');
  const [notizen, setNotizen] = useState('');
  const [pdfDatei, setPdfDatei] = useState<File | null>(null);
  const [speichern, setSpeichern] = useState(false);

  const ladeRechnungen = async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('rechnungen').select('*').order('ausstellungsdatum', { ascending: false }),
      supabase.from('patienten').select('id, vorname, nachname, patient_nr'),
    ]);
    const patMap = new Map((p ?? []).map(x => [x.id, x]));
    const list = (r ?? []).map(rech => ({
      ...rech,
      patient_name: patMap.has(rech.patient_id)
        ? `${patMap.get(rech.patient_id)!.vorname} ${patMap.get(rech.patient_id)!.nachname}`
        : '–',
    }));
    setRechnungen(list);
    setPatienten(p ?? []);
    setLaden(false);
  };

  useEffect(() => { ladeRechnungen(); }, []);

  async function handleSpeichern(e: FormEvent) {
    e.preventDefault();
    if (!patientId) { toast.error('Bitte Patient auswählen.'); return; }
    setSpeichern(true);

    let storagePath: string | null = null;
    if (pdfDatei) {
      const pfad = `${patientId}/${rechnungsnr.replace(/\//g, '-')}.pdf`;
      const { error: upErr } = await supabase.storage
        .from('rechnungen')
        .upload(pfad, pdfDatei, { contentType: 'application/pdf', upsert: true });
      if (upErr) {
        toast.error('PDF-Upload fehlgeschlagen.');
        setSpeichern(false);
        return;
      }
      storagePath = pfad;
    }

    const { error } = await supabase.from('rechnungen').insert({
      patient_id: patientId,
      rechnungsnr: rechnungsnr.trim(),
      ausstellungsdatum,
      faelligkeitsdatum: faelligkeitsdatum || null,
      gesamtbetrag: parseFloat(gesamtbetrag),
      bezahlt: false,
      storage_path: storagePath,
      notizen: notizen || null,
    });

    if (error) {
      toast.error('Fehler: ' + error.message);
    } else {
      toast.success('Rechnung gespeichert.');
      setNeuOffen(false);
      resetForm();
      await ladeRechnungen();
    }
    setSpeichern(false);
  }

  async function markiereAlsBezahlt(r: Rechnung) {
    await supabase.from('rechnungen').update({
      bezahlt: true,
      bezahlt_am: new Date().toISOString().split('T')[0],
    }).eq('id', r.id);
    toast.success('Als bezahlt markiert.');
    await ladeRechnungen();
  }

  async function loescheRechnung(r: Rechnung) {
    if (!confirm(`Rechnung ${r.rechnungsnr} löschen?`)) return;
    if (r.storage_path) {
      await supabase.storage.from('rechnungen').remove([r.storage_path]);
    }
    await supabase.from('rechnungen').delete().eq('id', r.id);
    toast.success('Rechnung gelöscht.');
    setRechnungen(prev => prev.filter(x => x.id !== r.id));
  }

  function resetForm() {
    setPatientId(''); setRechnungsnr(''); setAusstellungsdatum(new Date().toISOString().split('T')[0]);
    setFaelligkeitsdatum(''); setGesamtbetrag(''); setNotizen(''); setPdfDatei(null);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
          <p className="text-gray-500 text-sm mt-1">Rechnungen anlegen und PDFs bereitstellen</p>
        </div>
        <button
          onClick={() => setNeuOffen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl"
        >
          <Plus size={16} />
          Neue Rechnung
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {laden ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Patient</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Rechnungsnr.</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Datum</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Betrag</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rechnungen.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3.5 text-sm text-gray-900">{r.patient_name}</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{r.rechnungsnr}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">
                    {new Date(r.ausstellungsdatum).toLocaleDateString('de')}
                  </td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-gray-900 text-right">
                    {r.gesamtbetrag.toFixed(2).replace('.', ',')} €
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge label={r.bezahlt ? 'Bezahlt' : 'Offen'} variant={r.bezahlt ? 'green' : 'yellow'} />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {!r.bezahlt && (
                        <button
                          onClick={() => markiereAlsBezahlt(r)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Als bezahlt markieren"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => loescheRechnung(r)}
                        className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rechnungen.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-gray-400 py-12">
                    Keine Rechnungen vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={neuOffen} onClose={() => { setNeuOffen(false); resetForm(); }} title="Neue Rechnung" size="md">
        <form onSubmit={handleSpeichern} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Patient *</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} className={inputCls} required>
              <option value="">Patient auswählen …</option>
              {patienten.map(p => (
                <option key={p.id} value={p.id}>{p.vorname} {p.nachname} ({p.patient_nr})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rechnungsnr. *</label>
              <input value={rechnungsnr} onChange={e => setRechnungsnr(e.target.value)}
                placeholder="RE-2025-001" className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Betrag (€) *</label>
              <input type="number" step="0.01" min="0" value={gesamtbetrag}
                onChange={e => setGesamtbetrag(e.target.value)} placeholder="85.00" className={inputCls} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ausstellungsdatum *</label>
              <input type="date" value={ausstellungsdatum} onChange={e => setAusstellungsdatum(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fälligkeitsdatum</label>
              <input type="date" value={faelligkeitsdatum} onChange={e => setFaelligkeitsdatum(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PDF hochladen</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-green-400 cursor-pointer transition-colors">
                <Upload size={15} />
                {pdfDatei ? pdfDatei.name : 'PDF auswählen'}
                <input type="file" accept="application/pdf" className="hidden"
                  onChange={e => setPdfDatei(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notizen</label>
            <textarea value={notizen} onChange={e => setNotizen(e.target.value)}
              rows={2} className={inputCls} placeholder="Optional …" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setNeuOffen(false); resetForm(); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
              Abbrechen
            </button>
            <button type="submit" disabled={speichern}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 text-white text-sm font-semibold rounded-xl">
              {speichern ? 'Speichern …' : 'Speichern'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';
