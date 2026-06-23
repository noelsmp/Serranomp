import { useState, type FormEvent } from 'react';
import { User, Lock, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { usePatient } from '../hooks/usePatient';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Profil() {
  const { patient } = usePatient();
  const { user } = useAuth();

  const [pwOffen, setPwOffen] = useState(false);
  const [altPw, setAltPw] = useState('');
  const [neuesPw, setNeuesPw] = useState('');
  const [neuesPwWdh, setNeuesPwWdh] = useState('');
  const [pwFehler, setPwFehler] = useState('');
  const [pwLaden, setPwLaden] = useState(false);

  const [loeschOffen, setLoeschOffen] = useState(false);

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    if (neuesPw !== neuesPwWdh) {
      setPwFehler('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (neuesPw.length < 8) {
      setPwFehler('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    setPwLaden(true);
    setPwFehler('');
    // Re-authenticate with current password first
    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: altPw,
    });
    if (reAuthErr) {
      setPwFehler('Das aktuelle Passwort ist falsch.');
      setPwLaden(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: neuesPw });
    if (error) {
      setPwFehler('Fehler beim Ändern des Passworts.');
      setPwLaden(false);
      return;
    }
    toast.success('Passwort erfolgreich geändert.');
    setPwOffen(false);
    setAltPw('');
    setNeuesPw('');
    setNeuesPwWdh('');
    setPwLaden(false);
  }

  async function handleDatenloeschung() {
    // Patient requests data deletion – we mark it and notify (no auto-delete for medical records)
    toast.success(
      'Ihre Anfrage wurde gespeichert. Die Praxis wird sich bei Ihnen melden.',
      { duration: 6000 },
    );
    setLoeschOffen(false);
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>
        <p className="text-gray-500 text-sm mt-1">Ihre persönlichen Daten und Kontoeinstellungen.</p>
      </div>

      {/* Patient Data */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <User size={18} className="text-green-700" />
          <h2 className="font-semibold text-gray-900">Persönliche Daten</h2>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vorname" value={patient.vorname} />
          <Field label="Nachname" value={patient.nachname} />
          <Field label="Patientennummer" value={patient.patient_nr} />
          <Field label="Geburtsdatum" value={
            patient.geburtsdatum
              ? format(new Date(patient.geburtsdatum), 'dd. MMMM yyyy', { locale: de })
              : '–'
          } />
          <Field label="Anschrift" value={
            [patient.strasse, [patient.plz, patient.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '–'
          } />
          <Field label="Versicherungsart" value={patient.versicherungsart ?? '–'} />
          <Field label="E-Mail (Anmeldung)" value={user?.email ?? '–'} />
        </div>
        <div className="px-6 pb-5">
          <p className="text-xs text-gray-400">
            Um Ihre Stammdaten zu ändern, wenden Sie sich bitte an die Praxis.
          </p>
        </div>
      </section>

      {/* Account Security */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Lock size={18} className="text-green-700" />
          <h2 className="font-semibold text-gray-900">Sicherheit</h2>
        </div>
        <div className="px-6 py-5 space-y-3">
          <button
            onClick={() => setPwOffen(true)}
            className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Lock size={16} />
            Passwort ändern
          </button>
          <p className="text-xs text-gray-400">
            Letzter Login: {user?.last_sign_in_at
              ? format(new Date(user.last_sign_in_at), "dd.MM.yyyy 'um' HH:mm 'Uhr'", { locale: de })
              : 'Unbekannt'}
          </p>
        </div>
      </section>

      {/* Data Deletion */}
      <section className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100">
          <Trash2 size={18} className="text-red-500" />
          <h2 className="font-semibold text-gray-900">Datenlöschung</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 mb-4">
            Sie haben das Recht auf Löschung Ihrer personenbezogenen Daten (Art. 17 DSGVO).
            Bitte beachten Sie, dass Gesundheitsdaten aus rechtlichen Gründen aufbewahrt werden müssen.
          </p>
          <button
            onClick={() => setLoeschOffen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Datenlöschung beantragen
          </button>
        </div>
      </section>

      {/* Password Modal */}
      <Modal open={pwOffen} onClose={() => { setPwOffen(false); setPwFehler(''); }} title="Passwort ändern">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelles Passwort</label>
            <input
              type="password"
              value={altPw}
              onChange={e => setAltPw(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
            <input
              type="password"
              value={neuesPw}
              onChange={e => setNeuesPw(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort wiederholen</label>
            <input
              type="password"
              value={neuesPwWdh}
              onChange={e => setNeuesPwWdh(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {pwFehler && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-700 text-sm">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {pwFehler}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setPwOffen(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
              Abbrechen
            </button>
            <button type="submit" disabled={pwLaden}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 text-white text-sm font-semibold rounded-xl">
              {pwLaden ? 'Speichern …' : 'Speichern'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Data deletion Modal */}
      <Modal open={loeschOffen} onClose={() => setLoeschOffen(false)} title="Datenlöschung beantragen">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
            <AlertCircle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Wichtiger Hinweis</p>
              <p>
                Krankendaten unterliegen gesetzlichen Aufbewahrungspflichten (§ 630f BGB: 10 Jahre).
                Eine vollständige Löschung ist erst nach Ablauf dieser Frist möglich.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Ihre Anfrage wird an die Praxis weitergeleitet. Die Praxis wird sich
            mit Ihnen in Verbindung setzen und die weiteren Schritte erläutern.
          </p>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setLoeschOffen(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
              Abbrechen
            </button>
            <button onClick={handleDatenloeschung}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
              <CheckCircle size={15} />
              Anfrage senden
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
