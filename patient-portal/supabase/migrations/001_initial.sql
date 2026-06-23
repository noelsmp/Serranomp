-- ============================================================
-- Patientenportal – Initiale Datenbank-Migration
-- Supabase EU (Frankfurt) empfohlen für DSGVO-Konformität
-- ============================================================

-- Patienten-Stammdaten (verknüpft mit Supabase Auth)
create table public.patienten (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade unique not null,
  patient_nr       text not null unique,
  anrede           text check (anrede in ('Herr', 'Frau', 'Divers', null)),
  vorname          text not null,
  nachname         text not null,
  geburtsdatum     date,
  strasse          text,
  plz              text,
  ort              text,
  telefon          text,
  versicherungsart text default 'Selbstzahler',
  aktiv            boolean default true,
  erstellt         timestamptz default now(),
  aktualisiert     timestamptz default now()
);

-- Rechnungen
create table public.rechnungen (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid references public.patienten(id) on delete cascade not null,
  rechnungsnr         text not null unique,
  ausstellungsdatum   date not null,
  faelligkeitsdatum   date,
  gesamtbetrag        decimal(10,2) not null default 0,
  bezahlt             boolean default false,
  bezahlt_am          date,
  storage_path        text,
  notizen             text,
  erstellt            timestamptz default now()
);

-- Portal-Dokumente (von Patient oder Praxis hochgeladen)
create table public.portal_dokumente (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references public.patienten(id) on delete cascade not null,
  name             text not null,
  mime_typ         text not null,
  kategorie        text not null check (kategorie in ('Anamnesebogen','Befund','Bild','Labor','Sonstiges')),
  hochgeladen_von  text not null check (hochgeladen_von in ('patient','praxis')),
  beschreibung     text,
  storage_path     text not null,
  groesse          bigint not null default 0,
  erstellt         timestamptz default now()
);

-- ── Aktualisiert-Trigger ──────────────────────────────────────
create or replace function public.update_aktualisiert()
returns trigger language plpgsql as $$
begin
  new.aktualisiert = now();
  return new;
end;
$$;

create trigger patienten_aktualisiert
  before update on public.patienten
  for each row execute function public.update_aktualisiert();

-- ── Row Level Security ────────────────────────────────────────

alter table public.patienten enable row level security;
alter table public.rechnungen enable row level security;
alter table public.portal_dokumente enable row level security;

-- Hilfsfunktion: ist der aktuelle User Admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── patienten ─────────────────────────────────────────────────
create policy "Patient liest eigenes Profil"
  on public.patienten for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "Patient aktualisiert Profil"
  on public.patienten for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admin verwaltet Patienten"
  on public.patienten for all to authenticated
  using (public.is_admin());

-- ── rechnungen ────────────────────────────────────────────────
create policy "Patient liest eigene Rechnungen"
  on public.rechnungen for select to authenticated
  using (
    patient_id in (select id from public.patienten where user_id = auth.uid())
    or public.is_admin()
  );

create policy "Admin verwaltet Rechnungen"
  on public.rechnungen for all to authenticated
  using (public.is_admin());

-- ── portal_dokumente ──────────────────────────────────────────
create policy "Patient liest eigene Dokumente"
  on public.portal_dokumente for select to authenticated
  using (
    patient_id in (select id from public.patienten where user_id = auth.uid())
    or public.is_admin()
  );

create policy "Patient lädt Dokumente hoch"
  on public.portal_dokumente for insert to authenticated
  with check (
    hochgeladen_von = 'patient'
    and patient_id in (select id from public.patienten where user_id = auth.uid())
  );

create policy "Patient löscht eigene Uploads"
  on public.portal_dokumente for delete to authenticated
  using (
    hochgeladen_von = 'patient'
    and patient_id in (select id from public.patienten where user_id = auth.uid())
  );

create policy "Admin verwaltet alle Dokumente"
  on public.portal_dokumente for all to authenticated
  using (public.is_admin());

-- ── Storage Policies ─────────────────────────────────────────
-- Buckets: Erstelle in Supabase Dashboard → Storage → New Bucket:
--   Name: "rechnungen"       Private: true
--   Name: "portal-dokumente" Private: true

-- Rechnungs-PDFs: Patient liest eigene, Admin liest alle
create policy "Patient liest eigene Rechnungs-PDFs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'rechnungen'
    and (storage.foldername(name))[1] in (
      select id::text from public.patienten where user_id = auth.uid()
    )
  );

create policy "Admin verwaltet Rechnungs-PDFs"
  on storage.objects for all to authenticated
  using (bucket_id = 'rechnungen' and public.is_admin());

-- Portal-Dokumente
create policy "Patient liest eigene Portaldokumente"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'portal-dokumente'
    and (storage.foldername(name))[1] in (
      select id::text from public.patienten where user_id = auth.uid()
    )
  );

create policy "Patient lädt Portaldokumente hoch"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portal-dokumente'
    and (storage.foldername(name))[1] in (
      select id::text from public.patienten where user_id = auth.uid()
    )
  );

create policy "Patient löscht eigene Portaldokumente"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'portal-dokumente'
    and (storage.foldername(name))[1] in (
      select id::text from public.patienten where user_id = auth.uid()
    )
  );

create policy "Admin verwaltet alle Portaldokumente"
  on storage.objects for all to authenticated
  using (bucket_id = 'portal-dokumente' and public.is_admin());
