import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Datenschutz() {
  const { user } = useAuth();
  const praxisName = import.meta.env.VITE_PRAXIS_NAME ?? 'Naturheilpraxis Serrano';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!user && (
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800">
          <ArrowLeft size={15} />
          Zurück zur Anmeldung
        </Link>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <ShieldCheck size={20} className="text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datenschutzerklärung</h1>
          <p className="text-xs text-gray-400 mt-0.5">Patientenportal – Stand: Januar 2025</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">

        <Section title="1. Verantwortliche Stelle">
          <p>
            Verantwortlich im Sinne der DSGVO ist:
          </p>
          <address className="not-italic mt-2 text-sm bg-gray-50 rounded-xl p-4">
            <strong>{praxisName}</strong><br />
            Maria Serrano<br />
            Heilpraktikerin (gem. § 1 HeilprG)<br />
            naturheilpraxis-hilfreich.de<br />
            E-Mail: <a href="mailto:praxis@naturheilpraxis-hilfreich.de" className="text-green-700 hover:underline">
              praxis@naturheilpraxis-hilfreich.de
            </a>
          </address>
        </Section>

        <Section title="2. Zweck der Datenverarbeitung">
          <p>Das Patientenportal verarbeitet folgende Daten:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
            <li>Stammdaten (Name, Adresse, Geburtsdatum)</li>
            <li>Authentifizierungsdaten (E-Mail, verschlüsseltes Passwort)</li>
            <li>Rechnungsdaten (Rechnungsnummern, Beträge, Zahlungsstatus)</li>
            <li>Gesundheitsdokumente (Anamnesebögen, Befunde, Laborwerte, Bilder)</li>
            <li>Zugriffsprotokoll (letzter Login-Zeitstempel)</li>
          </ul>
          <p className="mt-3">
            Die Daten werden ausschließlich zur Durchführung der Heilbehandlung, zur
            Abrechnung und zur patientenbezogenen Kommunikation verarbeitet.
          </p>
        </Section>

        <Section title="3. Rechtsgrundlagen">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <strong className="text-gray-900">Art. 9 Abs. 2 lit. h DSGVO</strong> –
              Verarbeitung von Gesundheitsdaten für Zwecke der Gesundheitsvorsorge und
              medizinischen Diagnostik
            </li>
            <li>
              <strong className="text-gray-900">Art. 6 Abs. 1 lit. b DSGVO</strong> –
              Vertragserfüllung (Behandlungsvertrag)
            </li>
            <li>
              <strong className="text-gray-900">Art. 6 Abs. 1 lit. c DSGVO</strong> –
              Erfüllung gesetzlicher Pflichten (Aufbewahrungspflichten gem. § 630f BGB)
            </li>
            <li>
              <strong className="text-gray-900">Art. 6 Abs. 1 lit. a DSGVO</strong> –
              Einwilligung für die Nutzung des Patientenportals
            </li>
          </ul>
        </Section>

        <Section title="4. Datenspeicherung & Sicherheit">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <strong className="text-gray-900">Speicherort:</strong> Alle Daten werden
              auf Servern des Anbieters Supabase in der EU (Frankfurt, Deutschland) gespeichert.
            </li>
            <li>
              <strong className="text-gray-900">Verschlüsselung:</strong> Datenübertragung
              via TLS 1.3 (HTTPS). Passwörter werden mit bcrypt gehasht und niemals im
              Klartext gespeichert.
            </li>
            <li>
              <strong className="text-gray-900">Zugriffskontrolle:</strong> Row-Level-Security
              stellt sicher, dass jeder Patient ausschließlich seine eigenen Daten sieht.
            </li>
            <li>
              <strong className="text-gray-900">Aufbewahrung:</strong> Medizinische Unterlagen
              werden gemäß § 630f BGB mindestens 10 Jahre aufbewahrt.
            </li>
          </ul>
        </Section>

        <Section title="5. Weitergabe an Dritte">
          <p>
            Eine Weitergabe Ihrer Daten an Dritte findet grundsätzlich nicht statt.
            Ausnahmen bestehen nur bei gesetzlicher Verpflichtung (z. B. gerichtliche Anordnung).
            Die Nutzung von Supabase als technischem Dienstleister erfolgt auf Basis eines
            Auftragsverarbeitungsvertrags (Art. 28 DSGVO).
          </p>
        </Section>

        <Section title="6. Ihre Rechte (Art. 12–22 DSGVO)">
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li><strong className="text-gray-900">Auskunft (Art. 15)</strong> – Welche Daten über Sie gespeichert sind</li>
            <li><strong className="text-gray-900">Berichtigung (Art. 16)</strong> – Korrektur unrichtiger Daten</li>
            <li><strong className="text-gray-900">Löschung (Art. 17)</strong> – Löschung nach Ablauf der Aufbewahrungspflicht</li>
            <li><strong className="text-gray-900">Einschränkung (Art. 18)</strong> – Eingeschränkte Verarbeitung</li>
            <li><strong className="text-gray-900">Datenübertragbarkeit (Art. 20)</strong> – Export Ihrer Daten</li>
            <li><strong className="text-gray-900">Widerspruch (Art. 21)</strong> – Widerspruch gegen Verarbeitung</li>
            <li><strong className="text-gray-900">Widerruf (Art. 7 Abs. 3)</strong> – Widerruf einer erteilten Einwilligung</li>
          </ul>
          <p className="mt-3">
            Zur Ausübung Ihrer Rechte oder bei Beschwerden wenden Sie sich bitte direkt an
            die Praxis oder an die zuständige Datenschutz-Aufsichtsbehörde Ihres Bundeslandes.
          </p>
        </Section>

        <Section title="7. Cookies & Tracking">
          <p>
            Das Patientenportal verwendet <strong>keine Tracking-Cookies</strong> und
            keine Analyse-Tools. Die Sitzung wird ausschließlich über sichere,
            kurzlebige Browser-Tokens verwaltet (kein Langzeit-Tracking).
          </p>
        </Section>

        <Section title="8. Kontakt Datenschutz">
          <p>
            Bei Fragen zum Datenschutz wenden Sie sich bitte an:
          </p>
          <address className="not-italic mt-2 text-sm bg-gray-50 rounded-xl p-4">
            {praxisName}<br />
            E-Mail:{' '}
            <a href="mailto:datenschutz@naturheilpraxis-hilfreich.de" className="text-green-700 hover:underline">
              datenschutz@naturheilpraxis-hilfreich.de
            </a>
          </address>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
