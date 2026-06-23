import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Heart, ShieldCheck } from 'lucide-react';
import { db, getPraxisDaten } from '../db/database';
import { hashPin, setPortalSession } from './portalAuth';
import { useLiveQuery } from 'dexie-react-hooks';

export default function PortalLogin() {
  const [patientNr, setPatientNr] = useState('');
  const [pin, setPin] = useState('');
  const [pinSichtbar, setPinSichtbar] = useState(false);
  const [dsgvoAkzeptiert, setDsgvoAkzeptiert] = useState(false);
  const [fehler, setFehler] = useState('');
  const [laden, setLaden] = useState(false);
  const navigate = useNavigate();

  const praxis = useLiveQuery(() => getPraxisDaten(), []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!dsgvoAkzeptiert) {
      setFehler('Bitte akzeptieren Sie die Datenschutzerklärung, um fortzufahren.');
      return;
    }
    if (pin.length < 6) {
      setFehler('Bitte geben Sie Ihre 6-stellige PIN ein.');
      return;
    }
    setLaden(true);
    setFehler('');
    try {
      const patient = await db.patienten.where('patientNr').equals(patientNr.trim().toUpperCase()).first();
      if (!patient?.id) {
        setFehler('Patientennummer oder PIN ungültig.');
        return;
      }
      const zugang = await db.portalZugaenge.where('patientId').equals(patient.id).first();
      if (!zugang || !zugang.aktiv) {
        setFehler('Für diese Patientennummer ist kein Portal-Zugang aktiviert. Bitte wenden Sie sich an die Praxis.');
        return;
      }
      const pinHash = await hashPin(pin);
      if (zugang.pinHash !== pinHash) {
        setFehler('Patientennummer oder PIN ungültig.');
        return;
      }
      await db.portalZugaenge.update(zugang.id!, {
        letzterLogin: new Date().toISOString(),
        einwilligungDsgvo: true,
        einwilligungDsgvoDatum: zugang.einwilligungDsgvo
          ? zugang.einwilligungDsgvoDatum
          : new Date().toISOString(),
      });
      setPortalSession({
        patientId: patient.id,
        patientNr: patient.patientNr,
        vorname: patient.vorname,
        nachname: patient.nachname,
      });
      navigate('/portal/dashboard', { replace: true });
    } catch {
      setFehler('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 rounded-2xl mb-4 shadow-lg">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-800">Patientenportal</h1>
          <p className="text-gray-500 text-sm mt-1">{praxis?.name ?? 'Naturheilpraxis'}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Anmelden</h2>
          <p className="text-sm text-gray-500 mb-6">
            Melden Sie sich mit Ihrer Patientennummer und PIN an.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="patientnr" className="block text-sm font-medium text-gray-700 mb-1">
                Patientennummer
              </label>
              <input
                id="patientnr"
                type="text"
                value={patientNr}
                onChange={e => setPatientNr(e.target.value)}
                placeholder="z. B. P24-1234"
                autoComplete="username"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                PIN
              </label>
              <div className="relative">
                <input
                  id="pin"
                  type={pinSichtbar ? 'text' : 'password'}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-stellige PIN"
                  autoComplete="current-password"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPinSichtbar(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={pinSichtbar ? 'PIN verbergen' : 'PIN anzeigen'}
                >
                  {pinSichtbar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="dsgvo"
                checked={dsgvoAkzeptiert}
                onChange={e => setDsgvoAkzeptiert(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-green-700 cursor-pointer"
              />
              <label htmlFor="dsgvo" className="text-sm text-gray-600 cursor-pointer leading-snug">
                Ich habe die{' '}
                <Link
                  to="/portal/datenschutz"
                  target="_blank"
                  className="text-green-700 hover:text-green-800 underline underline-offset-2"
                >
                  Datenschutzerklärung
                </Link>{' '}
                gelesen und stimme der Verarbeitung meiner Daten zu.
              </label>
            </div>

            {fehler && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{fehler}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={laden}
              className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors mt-2"
            >
              {laden ? 'Anmelden …' : 'Anmelden'}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-2 justify-center mt-6 text-xs text-gray-400">
          <ShieldCheck size={14} />
          <span>Ihre Daten werden verschlüsselt und nur lokal gespeichert.</span>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Probleme bei der Anmeldung? Bitte wenden Sie sich an die Praxis.
        </p>
      </div>
    </div>
  );
}
