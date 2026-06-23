import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Heart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwSichtbar, setPwSichtbar] = useState(false);
  const [dsgvoOk, setDsgvoOk] = useState(false);
  const [fehler, setFehler] = useState('');
  const [laden, setLaden] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetGesendet, setResetGesendet] = useState(false);

  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const praxisName = import.meta.env.VITE_PRAXIS_NAME ?? 'Naturheilpraxis';

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!dsgvoOk) {
      setFehler('Bitte akzeptieren Sie die Datenschutzerklärung, um fortzufahren.');
      return;
    }
    setLaden(true);
    setFehler('');
    try {
      await signIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setFehler('E-Mail-Adresse oder Passwort ungültig.');
    } finally {
      setLaden(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler('');
    try {
      await resetPassword(email);
      setResetGesendet(true);
    } catch {
      setFehler('E-Mail-Adresse nicht gefunden oder Fehler aufgetreten.');
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 rounded-2xl mb-4 shadow-lg shadow-green-200">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-900">Patientenportal</h1>
          <p className="text-gray-400 text-sm mt-1">{praxisName}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-green-100/50 p-8">

          {resetMode ? (
            /* Password Reset */
            resetGesendet ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={24} className="text-green-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">E-Mail verschickt</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Wir haben einen Link zum Zurücksetzen Ihres Passworts an <strong>{email}</strong> gesendet.
                </p>
                <button
                  onClick={() => { setResetMode(false); setResetGesendet(false); }}
                  className="text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  Zurück zur Anmeldung
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Passwort zurücksetzen</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link.
                </p>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label htmlFor="email-reset" className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail-Adresse
                    </label>
                    <input
                      id="email-reset"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ihre@email.de"
                      autoComplete="email"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {fehler && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      {fehler}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={laden}
                    className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {laden ? 'Wird gesendet …' : 'Link senden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setResetMode(false); setFehler(''); }}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    Zurück zur Anmeldung
                  </button>
                </form>
              </>
            )
          ) : (
            /* Login Form */
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Anmelden</h2>
              <p className="text-sm text-gray-500 mb-6">
                Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ihre@email.de"
                    autoComplete="email"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Passwort
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={pwSichtbar ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Ihr Passwort"
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setPwSichtbar(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={pwSichtbar ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    >
                      {pwSichtbar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setResetMode(true); setFehler(''); }}
                    className="mt-1.5 text-xs text-green-700 hover:text-green-800"
                  >
                    Passwort vergessen?
                  </button>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="dsgvo"
                    checked={dsgvoOk}
                    onChange={e => setDsgvoOk(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-green-700 cursor-pointer"
                  />
                  <label htmlFor="dsgvo" className="text-xs text-gray-600 cursor-pointer leading-snug">
                    Ich habe die{' '}
                    <Link
                      to="/datenschutz"
                      target="_blank"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2"
                    >
                      Datenschutzerklärung
                    </Link>{' '}
                    gelesen und stimme der Verarbeitung meiner Gesundheitsdaten gemäß Art. 9 Abs. 2 lit. h DSGVO zu.
                  </label>
                </div>

                {fehler && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {fehler}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={laden}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
                  onClick={() => { if (!dsgvoOk) toast.error('Bitte akzeptieren Sie die Datenschutzerklärung.'); }}
                >
                  {laden ? 'Anmelden …' : 'Anmelden'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 justify-center mt-5 text-xs text-gray-400">
          <ShieldCheck size={13} />
          <span>Alle Daten werden verschlüsselt übertragen und DSGVO-konform gespeichert.</span>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Kein Zugang? Bitte wenden Sie sich an die Praxis.
        </p>
      </div>
    </div>
  );
}
