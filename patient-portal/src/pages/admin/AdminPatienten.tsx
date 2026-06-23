import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Search, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import type { Patient } from '../../types/database';
import toast from 'react-hot-toast';

export default function AdminPatienten() {
  const [patienten, setPatienten] = useState<Patient[]>([]);
  const [laden, setLaden] = useState(true);
  const [suche, setSuche] = useState('');
  const [neuOffen, setNeuOffen] = useState(false);

  // Form state
  const [userId, setUserId] = useState('');
  const [patientNr, setPatientNr] = useState('');
  const [anrede, setAnrede] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState('');
  const [strasse, setStrasse] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [telefon, setTelefon] = useState('');
  const [versicherungsart, setVersicherungsart] = useState('Selbstzahler');
  const [speichern, setSpeichern] = useState(false);

  const ladePatienten = async () => {
    const { data } = await supabase.from('patienten').select('*').order('nachname');
    setPatienten(data ?? []);
    setLaden(false);
  };

  useEffect(() => { ladePatienten(); }, []);

  async function handleSpeichern(e: FormEvent) {
    e.preventDefault();
    setSpeichern(true);
    const { error } = await supabase.from('patienten').insert({
      user_id: userId.trim(),
      patient_nr: patientNr.trim(),
      anrede: anrede || null,
      vorname: vorname.trim(),
      nachname: nachname.trim(),
      geburtsdatum: geburtsdatum || null,
      strasse: strasse || null,
      plz: plz || null,
      ort: ort || null,
      telefon: telefon || null,
      versicherungsart,
      aktiv: true,
    });
    if (error) {
      toast.error('Fehler beim Speichern: ' + error.message);
    } else {
      toast.success('Patient angelegt.');
      setNeuOffen(false);
      resetForm();
      await ladePatienten();
    }
    setSpeichern(false);
  }

  function resetForm() {
    setUserId(''); setPatientNr(''); setAnrede(''); setVorname('');
    setNachname(''); setGeburtsdatum(''); setStrasse(''); setPlz('');
    setOrt(''); setTelefon(''); setVersicherungsart('Selbstzahler');
  }

  const gefiltert = patienten.filter(p =>
    suche === '' ||
    `${p.vorname} ${p.nachname} ${p.patient_nr}`.toLowerCase().includes(suche.toLowerCase()),
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patienten</h1>
          <p className="text-gray-500 text-sm mt-1">Patientenstammdaten verwalten</p>
        </div>
        <button
          onClick={() => setNeuOffen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl"
        >
          <Plus size={16} />
          Neu anlegen
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          placeholder="Suchen …"
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
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
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Nr.</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Geburtsdatum</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Versicherung</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gefiltert.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-medium text-gray-900">
                      {p.anrede ? `${p.anrede} ` : ''}{p.vorname} {p.nachname}
                    </p>
                    <p className="text-xs text-gray-400">{p.telefon ?? '–'}</p>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600">{p.patient_nr}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-600">
                    {p.geburtsdatum ? new Date(p.geburtsdatum).toLocaleDateString('de') : '–'}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600">{p.versicherungsart ?? '–'}</td>
                  <td className="px-6 py-3.5">
                    {p.aktiv
                      ? <Badge label="Aktiv" variant="green" />
                      : <Badge label="Inaktiv" variant="gray" />}
                  </td>
                </tr>
              ))}
              {gefiltert.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-gray-400 py-12">
                    Keine Patienten gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* New Patient Modal */}
      <Modal open={neuOffen} onClose={() => { setNeuOffen(false); resetForm(); }} title="Patient anlegen" size="lg">
        <form onSubmit={handleSpeichern} className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
            <strong>Schritt 1:</strong> Laden Sie den Patienten zuerst im Supabase Dashboard ein
            (Authentication → Users → Invite). Kopieren Sie danach die User-ID hierher.
          </div>

          <Row>
            <Field label="Supabase User-ID" required>
              <input value={userId} onChange={e => setUserId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className={inputCls} required />
            </Field>
            <Field label="Patientennummer" required>
              <input value={patientNr} onChange={e => setPatientNr(e.target.value)}
                placeholder="P25-0001" className={inputCls} required />
            </Field>
          </Row>
          <Row>
            <Field label="Anrede">
              <select value={anrede} onChange={e => setAnrede(e.target.value)} className={inputCls}>
                <option value="">–</option>
                <option>Herr</option>
                <option>Frau</option>
                <option>Divers</option>
              </select>
            </Field>
            <Field label="Vorname" required>
              <input value={vorname} onChange={e => setVorname(e.target.value)} className={inputCls} required />
            </Field>
            <Field label="Nachname" required>
              <input value={nachname} onChange={e => setNachname(e.target.value)} className={inputCls} required />
            </Field>
          </Row>
          <Row>
            <Field label="Geburtsdatum">
              <input type="date" value={geburtsdatum} onChange={e => setGeburtsdatum(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Versicherungsart">
              <select value={versicherungsart} onChange={e => setVersicherungsart(e.target.value)} className={inputCls}>
                <option>Selbstzahler</option>
                <option>GKV</option>
                <option>PKV</option>
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Straße">
              <input value={strasse} onChange={e => setStrasse(e.target.value)} className={inputCls} />
            </Field>
            <Field label="PLZ">
              <input value={plz} onChange={e => setPlz(e.target.value)} className={inputCls} maxLength={5} />
            </Field>
            <Field label="Ort">
              <input value={ort} onChange={e => setOrt(e.target.value)} className={inputCls} />
            </Field>
          </Row>
          <Field label="Telefon">
            <input value={telefon} onChange={e => setTelefon(e.target.value)} className={inputCls} />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setNeuOffen(false); resetForm(); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
              Abbrechen
            </button>
            <button type="submit" disabled={speichern}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
              <UserCheck size={15} />
              {speichern ? 'Speichern …' : 'Patient anlegen'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
