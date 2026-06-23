import { useEffect, useRef, useState } from 'react';
import {
  Upload, Download, Trash2, FolderOpen, FileText, Image,
  FlaskConical, FilePlus, X, AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { usePatient } from '../hooks/usePatient';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import type { PortalDokument } from '../types/database';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

type Tab = 'praxis' | 'meine';
type Kategorie = PortalDokument['kategorie'];

const KATEGORIEN: Kategorie[] = ['Anamnesebogen', 'Befund', 'Bild', 'Labor', 'Sonstiges'];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ERLAUBTE_TYPEN = [
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp',
];

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image size={18} className="text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileText size={18} className="text-red-500" />;
  return <FlaskConical size={18} className="text-purple-500" />;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

export default function Dokumente() {
  const { patient } = usePatient();
  const [dokumente, setDokumente] = useState<PortalDokument[]>([]);
  const [laden, setLaden] = useState(true);
  const [tab, setTab] = useState<Tab>('praxis');
  const [uploadOffen, setUploadOffen] = useState(false);

  // Upload state
  const [datei, setDatei] = useState<File | null>(null);
  const [kategorie, setKategorie] = useState<Kategorie>('Sonstiges');
  const [beschreibung, setBeschreibung] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFehler, setUploadFehler] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const ladeDokumente = async () => {
    if (!patient) return;
    const { data } = await supabase
      .from('portal_dokumente')
      .select('*')
      .eq('patient_id', patient.id)
      .order('erstellt', { ascending: false });
    setDokumente(data ?? []);
    setLaden(false);
  };

  useEffect(() => { ladeDokumente(); }, [patient]);

  const angezeigt = dokumente.filter(d =>
    tab === 'praxis' ? d.hochgeladen_von === 'praxis' : d.hochgeladen_von === 'patient',
  );

  async function handleUpload() {
    if (!datei || !patient) return;
    if (datei.size > MAX_SIZE) {
      setUploadFehler(`Datei zu groß (max. ${formatBytes(MAX_SIZE)}).`);
      return;
    }
    if (!ERLAUBTE_TYPEN.includes(datei.type)) {
      setUploadFehler('Nicht unterstütztes Format. Erlaubt: PDF, JPG, PNG, HEIC, WebP.');
      return;
    }
    setUploading(true);
    setUploadFehler('');
    const ext = datei.name.split('.').pop();
    const pfad = `${patient.id}/${Date.now()}.${ext}`;
    const { error: storageErr } = await supabase.storage
      .from('portal-dokumente')
      .upload(pfad, datei, { contentType: datei.type });
    if (storageErr) {
      setUploadFehler('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setUploading(false);
      return;
    }
    const { error: dbErr } = await supabase.from('portal_dokumente').insert({
      patient_id: patient.id,
      name: datei.name,
      mime_typ: datei.type,
      kategorie,
      hochgeladen_von: 'patient',
      beschreibung: beschreibung || null,
      storage_path: pfad,
      groesse: datei.size,
    });
    if (dbErr) {
      await supabase.storage.from('portal-dokumente').remove([pfad]);
      setUploadFehler('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
      setUploading(false);
      return;
    }
    toast.success('Dokument erfolgreich hochgeladen.');
    setUploadOffen(false);
    setDatei(null);
    setBeschreibung('');
    setKategorie('Sonstiges');
    setTab('meine');
    await ladeDokumente();
    setUploading(false);
  }

  async function handleDownload(dok: PortalDokument) {
    const { data, error } = await supabase.storage
      .from(dok.hochgeladen_von === 'praxis' ? 'portal-dokumente' : 'portal-dokumente')
      .download(dok.storage_path);
    if (error || !data) {
      toast.error('Fehler beim Herunterladen.');
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = dok.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(dok: PortalDokument) {
    if (!confirm(`„${dok.name}" wirklich löschen?`)) return;
    await supabase.storage.from('portal-dokumente').remove([dok.storage_path]);
    await supabase.from('portal_dokumente').delete().eq('id', dok.id);
    toast.success('Dokument gelöscht.');
    setDokumente(prev => prev.filter(d => d.id !== dok.id));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumente</h1>
          <p className="text-gray-500 text-sm mt-1">
            Laden Sie Dokumente herunter oder laden Sie eigene Dateien hoch.
          </p>
        </div>
        <button
          onClick={() => { setUploadOffen(true); setUploadFehler(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Hochladen</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'praxis' as Tab, label: 'Von der Praxis' },
          { id: 'meine' as Tab, label: 'Meine Uploads' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
              tab === t.id ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {laden ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : angezeigt.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FolderOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {tab === 'praxis'
                ? 'Noch keine Dokumente von der Praxis.'
                : 'Sie haben noch keine Dokumente hochgeladen.'}
            </p>
            {tab === 'meine' && (
              <button
                onClick={() => setUploadOffen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white text-sm rounded-xl"
              >
                <FilePlus size={15} />
                Erstes Dokument hochladen
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {angezeigt.map(d => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  {fileIcon(d.mime_typ)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge label={d.kategorie} variant="gray" />
                    <span className="text-xs text-gray-400">
                      {formatBytes(d.groesse)} · {format(new Date(d.erstellt), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                  {d.beschreibung && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{d.beschreibung}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDownload(d)}
                    className="p-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="Herunterladen"
                  >
                    <Download size={16} />
                  </button>
                  {d.hochgeladen_von === 'patient' && (
                    <button
                      onClick={() => handleDelete(d)}
                      className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal open={uploadOffen} onClose={() => setUploadOffen(false)} title="Dokument hochladen">
        <div className="space-y-4">
          {/* File drop area */}
          <div
            onClick={() => fileRef.current?.click()}
            className={clsx(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
              datei
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30',
            )}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setDatei(f); setUploadFehler(''); }
              }}
            />
            {datei ? (
              <div className="flex items-center justify-center gap-3">
                {fileIcon(datei.type)}
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{datei.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(datei.size)}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setDatei(null); }}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Datei auswählen oder hier ablegen</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, HEIC · max. 20 MB</p>
              </>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select
              value={kategorie}
              onChange={e => setKategorie(e.target.value as Kategorie)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={beschreibung}
              onChange={e => setBeschreibung(e.target.value)}
              placeholder="z. B. Blutbild vom 15.01.2025"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* DSGVO notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Ihre Dateien werden verschlüsselt übertragen und DSGVO-konform auf EU-Servern gespeichert.
              Nur Sie und die Praxis haben Zugriff.
            </span>
          </div>

          {uploadFehler && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-700 text-sm">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {uploadFehler}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setUploadOffen(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleUpload}
              disabled={!datei || uploading}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {uploading ? 'Wird hochgeladen …' : 'Hochladen'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
