import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, FolderOpen, X } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import type { Patient, PortalDokument } from '../../types/database';
import toast from 'react-hot-toast';

type Kategorie = PortalDokument['kategorie'];
const KATEGORIEN: Kategorie[] = ['Anamnesebogen', 'Befund', 'Bild', 'Labor', 'Sonstiges'];
const MAX_SIZE = 20 * 1024 * 1024;

export default function AdminDokumente() {
  const [patienten, setPatienten] = useState<Patient[]>([]);
  const [dokumente, setDokumente] = useState<(PortalDokument & { patient_name?: string })[]>([]);
  const [laden, setLaden] = useState(true);
  const [filterPatient, setFilterPatient] = useState('');
  const [uploadOffen, setUploadOffen] = useState(false);

  // Upload state
  const [patientId, setPatientId] = useState('');
  const [datei, setDatei] = useState<File | null>(null);
  const [kategorie, setKategorie] = useState<Kategorie>('Anamnesebogen');
  const [beschreibung, setBeschreibung] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ladeDaten = async () => {
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from('patienten').select('*').order('nachname'),
      supabase.from('portal_dokumente').select('*').order('erstellt', { ascending: false }),
    ]);
    const patMap = new Map((p ?? []).map(x => [x.id, x]));
    setDokumente((d ?? []).map(dok => ({
      ...dok,
      patient_name: patMap.has(dok.patient_id)
        ? `${patMap.get(dok.patient_id)!.vorname} ${patMap.get(dok.patient_id)!.nachname}`
        : '–',
    })));
    setPatienten(p ?? []);
    setLaden(false);
  };

  useEffect(() => { ladeDaten(); }, []);

  async function handleUpload() {
    if (!datei || !patientId) return;
    if (datei.size > MAX_SIZE) { toast.error('Datei zu groß (max. 20 MB).'); return; }
    setUploading(true);
    const ext = datei.name.split('.').pop();
    const pfad = `${patientId}/${Date.now()}-praxis.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('portal-dokumente')
      .upload(pfad, datei, { contentType: datei.type });
    if (upErr) { toast.error('Upload fehlgeschlagen.'); setUploading(false); return; }
    const { error: dbErr } = await supabase.from('portal_dokumente').insert({
      patient_id: patientId,
      name: datei.name,
      mime_typ: datei.type,
      kategorie,
      hochgeladen_von: 'praxis',
      beschreibung: beschreibung || null,
      storage_path: pfad,
      groesse: datei.size,
    });
    if (dbErr) {
      await supabase.storage.from('portal-dokumente').remove([pfad]);
      toast.error('Fehler beim Speichern.');
      setUploading(false);
      return;
    }
    toast.success('Dokument bereitgestellt.');
    setUploadOffen(false);
    setDatei(null); setBeschreibung(''); setPatientId(''); setKategorie('Anamnesebogen');
    await ladeDaten();
    setUploading(false);
  }

  async function handleDelete(dok: PortalDokument) {
    if (!confirm(`„${dok.name}" löschen?`)) return;
    await supabase.storage.from('portal-dokumente').remove([dok.storage_path]);
    await supabase.from('portal_dokumente').delete().eq('id', dok.id);
    toast.success('Dokument gelöscht.');
    setDokumente(prev => prev.filter(d => d.id !== dok.id));
  }

  const gefiltert = filterPatient
    ? dokumente.filter(d => d.patient_id === filterPatient)
    : dokumente;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumente</h1>
          <p className="text-gray-500 text-sm mt-1">Dokumente für Patienten bereitstellen</p>
        </div>
        <button
          onClick={() => setUploadOffen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl"
        >
          <Upload size={16} />
          Hochladen
        </button>
      </div>

      <div className="max-w-xs">
        <select value={filterPatient} onChange={e => setFilterPatient(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">Alle Patienten</option>
          {patienten.map(p => (
            <option key={p.id} value={p.id}>{p.vorname} {p.nachname}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {laden ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gefiltert.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FolderOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Keine Dokumente vorhanden.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {gefiltert.map(d => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">{(d as PortalDokument & { patient_name?: string }).patient_name}</span>
                    <Badge label={d.kategorie} variant="gray" />
                    <Badge
                      label={d.hochgeladen_von === 'praxis' ? 'Von Praxis' : 'Patient-Upload'}
                      variant={d.hochgeladen_von === 'praxis' ? 'blue' : 'green'}
                    />
                    <span className="text-xs text-gray-400">
                      {format(new Date(d.erstellt), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(d)}
                  className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal open={uploadOffen} onClose={() => { setUploadOffen(false); setDatei(null); }} title="Dokument bereitstellen">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Patient *</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" required>
              <option value="">Patient auswählen …</option>
              {patienten.map(p => (
                <option key={p.id} value={p.id}>{p.vorname} {p.nachname} ({p.patient_nr})</option>
              ))}
            </select>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-green-300 rounded-xl p-6 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp"
              onChange={e => { const f = e.target.files?.[0]; if (f) setDatei(f); }}
            />
            {datei ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{datei.name}</span>
                <button onClick={e => { e.stopPropagation(); setDatei(null); }} className="p-1 text-gray-400">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Datei auswählen</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, HEIC · max. 20 MB</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kategorie</label>
            <select value={kategorie} onChange={e => setKategorie(e.target.value as Kategorie)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              {KATEGORIEN.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Beschreibung (optional)</label>
            <input value={beschreibung} onChange={e => setBeschreibung(e.target.value)}
              placeholder="z. B. Laborbefund vom 15.01.2025"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={() => { setUploadOffen(false); setDatei(null); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
              Abbrechen
            </button>
            <button onClick={handleUpload} disabled={!datei || !patientId || uploading}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl">
              {uploading ? 'Hochladen …' : 'Bereitstellen'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
