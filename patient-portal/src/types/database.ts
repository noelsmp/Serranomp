export interface Patient {
  id: string;
  user_id: string;
  patient_nr: string;
  anrede: string | null;
  vorname: string;
  nachname: string;
  geburtsdatum: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  telefon: string | null;
  versicherungsart: string | null;
  aktiv: boolean;
  erstellt: string;
  aktualisiert: string;
}

export interface Rechnung {
  id: string;
  patient_id: string;
  rechnungsnr: string;
  ausstellungsdatum: string;
  faelligkeitsdatum: string | null;
  gesamtbetrag: number;
  bezahlt: boolean;
  bezahlt_am: string | null;
  storage_path: string | null;
  notizen: string | null;
  erstellt: string;
}

export interface PortalDokument {
  id: string;
  patient_id: string;
  name: string;
  mime_typ: string;
  kategorie: 'Anamnesebogen' | 'Befund' | 'Bild' | 'Labor' | 'Sonstiges';
  hochgeladen_von: 'patient' | 'praxis';
  beschreibung: string | null;
  storage_path: string;
  groesse: number;
  erstellt: string;
}

// Minimal Supabase Database type for client typing
export interface Database {
  public: {
    Tables: {
      patienten: {
        Row: Patient;
        Insert: Omit<Patient, 'id' | 'erstellt' | 'aktualisiert'>;
        Update: Partial<Omit<Patient, 'id' | 'erstellt' | 'aktualisiert'>>;
      };
      rechnungen: {
        Row: Rechnung;
        Insert: Omit<Rechnung, 'id' | 'erstellt'>;
        Update: Partial<Omit<Rechnung, 'id' | 'erstellt'>>;
      };
      portal_dokumente: {
        Row: PortalDokument;
        Insert: Omit<PortalDokument, 'id' | 'erstellt'>;
        Update: Partial<Omit<PortalDokument, 'id' | 'erstellt'>>;
      };
    };
  };
}
