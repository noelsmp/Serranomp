# DSGVO-Checkliste – Patientenportal Naturheilpraxis Hilfreich

## Technische Maßnahmen

- [x] **Datenspeicherung ausschließlich auf Hetzner-Server (Deutschland)** — SQLite-Datenbank und Uploads auf dem eigenen Server, keine Cloud-Services mit US-Datentransfer
- [x] **Passwörter gehasht mit bcrypt** (Kostenfaktor 12) — Klartextpasswörter werden nie gespeichert
- [x] **HTTPS erzwungen** — HSTS-Header in `next.config.ts` konfiguriert
- [x] **Session-Timeout nach 30 Minuten** — Konfigurierbar über `SESSION_TIMEOUT_SECONDS`
- [x] **Audit-Log** — Jeder Login, Up- und Download wird mit Timestamp, User-ID und IP protokolliert
- [x] **Zugriffskontrolle** — Patienten können nur eigene Dokumente herunterladen (serverseitig geprüft)
- [x] **Content-Security-Policy** — XSS-Schutz über HTTP-Header
- [x] **X-Frame-Options: DENY** — Clickjacking-Schutz
- [x] **Datei-Downloads nur über API-Route** — Keine direkten Datei-URLs, kein öffentlicher Zugriff auf Upload-Verzeichnis
- [x] **Upload-Verzeichnis außerhalb des Web-Root** — Konfigurierbar über `UPLOADS_PATH`
- [x] **Einwilligungspflicht bei Registrierung** — Datenschutzerklärung und Nutzungsbedingungen müssen aktiv akzeptiert werden
- [x] **Admin-Freischaltung** — Kein automatischer Kontozugang, manuele Prüfung durch Heilpraktikerin

## Organisatorische Maßnahmen

- [ ] **Auftragsverarbeitungsvertrag (AVV) mit Resend** abschließen — [resend.com/dpa](https://resend.com/dpa)
- [ ] **AVV mit Hetzner** abschließen — [hetzner.com/rechtliches/auftragsverarbeitung](https://www.hetzner.com/rechtliches/auftragsverarbeitung)
- [ ] **Datenschutzerklärung auf der Homepage aktualisieren** — Das Patientenportal als Verarbeitungszweck aufnehmen
- [ ] **Verarbeitungsverzeichnis (Art. 30 DSGVO) ergänzen** — Patientenportal als neuen Verarbeitungsvorgang dokumentieren
- [ ] **Technisch-Organisatorische Maßnahmen (TOM) dokumentieren** — Diese Checkliste als Ausgangspunkt verwenden
- [ ] **Regelmäßige Datensicherung** einrichten — SQLite-Datenbank und Upload-Verzeichnis täglich sichern
- [ ] **Löschkonzept** definieren — Wie lange werden Patientendaten aufbewahrt? (GoBD: i.d.R. 10 Jahre)

## Betroffenenrechte (Art. 15-22 DSGVO)

Patienten können über das Portal jederzeit:
- **Auskunft** über gespeicherte Daten anfordern
- **Löschung** beantragen
- **Datenexport** anfordern

→ DSGVO-Anfragen werden in der Tabelle `dsgvo_anfragen` gespeichert und an die Praxis weitergeleitet.

## Datenkategorien und Zwecke

| Datenkategorie | Zweck | Rechtsgrundlage |
|---|---|---|
| Name, E-Mail, Geburtsdatum, Telefon | Patientenidentifikation und Kommunikation | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) |
| Behandlungsdokumente, Befunde | Medizinische Dokumentation | Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsversorgung) |
| Login-/Download-Logs | IT-Sicherheit und Nachweispflichten | Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung) |
| Passwort-Hash | Authentifizierung | Art. 6 Abs. 1 lit. b DSGVO |

## Notfallplan

Bei einem Datenschutzvorfall (Datenleck, unbefugter Zugriff):
1. Server sofort isolieren / Dienst stoppen
2. Vorfallsdokumentation erstellen
3. Datenschutzbehörde NRW innerhalb von 72 Stunden informieren: [ldi.nrw.de](https://www.ldi.nrw.de)
4. Betroffene Patienten informieren

**Datenschutzbeauftragte:** Für Heilpraktikerpraxen unter 20 Mitarbeitern mit EDV-Datenspeicherung ist ein DSB empfohlen, aber nicht gesetzlich verpflichtend.
