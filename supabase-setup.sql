-- ============================================================
-- PATIENTENPORTAL – Supabase Setup
-- Dieses Script im Supabase SQL-Editor ausführen
-- ============================================================

-- ── 1. Tabellen anlegen ───────────────────────────────────

-- Patientenprofile (verknüpft mit Auth-User)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    vorname         TEXT NOT NULL DEFAULT '',
    nachname        TEXT NOT NULL DEFAULT '',
    email           TEXT NOT NULL DEFAULT '',
    geburtsdatum    DATE,
    praxis_patient_nr TEXT,
    erstellt        TIMESTAMPTZ DEFAULT NOW()
);

-- Rechnungen (werden von der Praxis eingetragen)
CREATE TABLE IF NOT EXISTS portal_rechnungen (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id          UUID REFERENCES patient_profiles(id) ON DELETE CASCADE NOT NULL,
    rechnungsnr         TEXT NOT NULL,
    ausstellungsdatum   DATE NOT NULL,
    faelligkeitsdatum   DATE NOT NULL,
    gesamtbetrag        DECIMAL(10,2) NOT NULL,
    bezahlt             BOOLEAN DEFAULT FALSE,
    bezahlt_am          TIMESTAMPTZ,
    pdf_storage_path    TEXT,
    erstellt            TIMESTAMPTZ DEFAULT NOW()
);

-- Dokumente (Upload von Patient und Praxis)
CREATE TABLE IF NOT EXISTS portal_dokumente (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id      UUID REFERENCES patient_profiles(id) ON DELETE CASCADE NOT NULL,
    name            TEXT NOT NULL,
    typ             TEXT NOT NULL CHECK (typ IN ('anamnesebogen','befund','blutwerte','sonstiges','praxis')),
    storage_path    TEXT NOT NULL,
    uploaded_by     TEXT DEFAULT 'patient' CHECK (uploaded_by IN ('patient','praxis')),
    erstellt        TIMESTAMPTZ DEFAULT NOW()
);

-- DSGVO-Anfragen
CREATE TABLE IF NOT EXISTS portal_dsgvo_anfragen (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id  UUID REFERENCES patient_profiles(id) ON DELETE CASCADE NOT NULL,
    email       TEXT NOT NULL,
    typ         TEXT NOT NULL CHECK (typ IN ('auskunft','loeschung','export')),
    nachricht   TEXT,
    bearbeitet  BOOLEAN DEFAULT FALSE,
    erstellt    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 2. Row Level Security aktivieren ─────────────────────

ALTER TABLE patient_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_rechnungen    ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dokumente     ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_dsgvo_anfragen ENABLE ROW LEVEL SECURITY;


-- ── 3. RLS-Policies: Patienten sehen nur eigene Daten ────

-- patient_profiles
CREATE POLICY "patient_eigenes_profil"
    ON patient_profiles FOR ALL
    USING (auth.uid() = id);

-- portal_rechnungen: Patient darf nur eigene sehen (nicht bearbeiten)
CREATE POLICY "patient_eigene_rechnungen"
    ON portal_rechnungen FOR SELECT
    USING (auth.uid() = patient_id);

-- portal_dokumente: Patient darf eigene sehen, hochladen, aber nicht löschen
CREATE POLICY "patient_eigene_dokumente_lesen"
    ON portal_dokumente FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "patient_eigene_dokumente_hochladen"
    ON portal_dokumente FOR INSERT
    WITH CHECK (auth.uid() = patient_id AND uploaded_by = 'patient');

-- portal_dsgvo_anfragen
CREATE POLICY "patient_eigene_anfragen"
    ON portal_dsgvo_anfragen FOR INSERT
    WITH CHECK (auth.uid() = patient_id);


-- ── 4. Storage Bucket anlegen ────────────────────────────
-- (Im Supabase Dashboard unter Storage → New Bucket)
-- Name: patient-files
-- Private: JA (nicht öffentlich!)
-- Allowed MIME types: application/pdf, image/jpeg, image/png


-- ── 5. Storage-Policies ──────────────────────────────────
-- Im Supabase Dashboard unter Storage → patient-files → Policies:

-- SELECT (Lesen): auth.uid()::text = (storage.foldername(name))[1]
-- INSERT (Upload): auth.uid()::text = (storage.foldername(name))[1]

-- Als SQL:
CREATE POLICY "patient_eigene_dateien_lesen"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'patient-files'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "patient_eigene_dateien_hochladen"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'patient-files'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- ── 6. Patienten einladen (im Supabase Dashboard) ────────
-- Authentication → Users → Invite User
-- E-Mail eingeben → Patient bekommt Link zum Passwort setzen
-- Danach hier Profil anlegen:

-- INSERT INTO patient_profiles (id, vorname, nachname, email, geburtsdatum, praxis_patient_nr)
-- SELECT id, 'Max', 'Mustermann', email, '1980-01-15', 'P-001'
-- FROM auth.users WHERE email = 'patient@example.com';


-- ── 7. Rechnung für Patient eintragen (Praxis macht das) ──

-- INSERT INTO portal_rechnungen
--   (patient_id, rechnungsnr, ausstellungsdatum, faelligkeitsdatum, gesamtbetrag)
-- SELECT p.id, 'R-2025-001', '2025-01-15', '2025-01-29', 85.00
-- FROM patient_profiles p WHERE p.email = 'patient@example.com';
