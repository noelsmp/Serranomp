# Patientenportal – Naturheilpraxis Hilfreich

Sicheres Patientenportal für die Naturheilpraxis Hilfreich, Moers. DSGVO-konform, alle Daten auf Hetzner-Server in Deutschland.

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Datenbank | SQLite (via Drizzle ORM + better-sqlite3) |
| Auth | Eigene Session-basierte Auth (bcrypt + Cookies) |
| Datei-Storage | Lokales Dateisystem auf dem Server |
| E-Mail | Resend (DSGVO-konform, EU) |
| Hosting | Hetzner Cloud CX22, Standort Falkenstein (DE) |
| Sprache | TypeScript / Deutsch |

## Voraussetzungen

- Node.js 22+
- npm 10+

## Lokale Entwicklung

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen kopieren und ausfüllen
cp .env.example .env.local

# 3. Datenbank initialisieren
npm run db:migrate

# 4. Admin-Konto anlegen
npm run db:seed

# 5. Entwicklungsserver starten
npm run dev
```

Portal ist erreichbar unter: http://localhost:3000

## Deployment auf Hetzner CX22

### Server vorbereiten

```bash
# Ubuntu 24.04 LTS (empfohlen)
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx

# Node.js 22 installieren
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# PM2 für Prozessverwaltung
npm install -g pm2
```

### Datenverzeichnis anlegen (außerhalb Web-Root!)

```bash
mkdir -p /var/data/patientenportal/uploads
chown -R www-data:www-data /var/data/patientenportal
```

### App deployen

```bash
# App nach /var/www/patientenportal klonen/kopieren
cd /var/www/patientenportal

# .env anlegen (mit echten Werten aus .env.example)
nano .env

# Abhängigkeiten und Build
npm install --production=false
npm run build

# Datenbank initialisieren
npm run db:migrate
npm run db:seed

# PM2 starten
pm2 start npm --name "patientenportal" -- start
pm2 startup
pm2 save
```

### Nginx-Konfiguration

```nginx
server {
    listen 80;
    server_name portal.naturheilpraxis-hilfreich.de;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.naturheilpraxis-hilfreich.de;

    ssl_certificate /etc/letsencrypt/live/portal.naturheilpraxis-hilfreich.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.naturheilpraxis-hilfreich.de/privkey.pem;

    # UPLOADS-Verzeichnis NIEMALS direkt freigeben!
    location ~ ^/var/data/ {
        deny all;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# SSL-Zertifikat (Let's Encrypt, kostenlos)
certbot --nginx -d portal.naturheilpraxis-hilfreich.de
```

### Automatische Datensicherung

```bash
# /etc/cron.d/patientenportal-backup
0 2 * * * root tar -czf /backup/portal-$(date +\%Y\%m\%d).tar.gz \
  /var/data/patientenportal/ && \
  find /backup -name "portal-*.tar.gz" -mtime +30 -delete
```

## Benutzerrollen

| Rolle | Zugang | Beschreibung |
|---|---|---|
| `admin` | `/admin` | Heilpraktikerin – voller Zugriff |
| `patient` | `/dashboard` | Nur eigene Daten sichtbar |

## E-Mail-Benachrichtigungen

| Ereignis | Empfänger |
|---|---|
| Neue Registrierung | Heilpraktikerin |
| Zugang freigeschaltet | Patient |
| Zugang abgelehnt | Patient |
| Praxis lädt Dokument hoch | Patient |
| Patient lädt Dokument hoch | Heilpraktikerin |

## Passwort zurücksetzen

```bash
# Im Projektverzeichnis:
node -e "
const db = require('./src/lib/db/index').db;
const bcrypt = require('bcryptjs');
const { benutzer } = require('./src/lib/db/schema');
const { eq } = require('drizzle-orm');
const hash = bcrypt.hashSync('NeuesPasswort123!', 12);
db.update(benutzer).set({ passwortHash: hash }).where(eq(benutzer.email, 'email@example.de')).run();
console.log('Passwort aktualisiert.');
"
```

## Lizenz

Privat – alle Rechte vorbehalten. Nicht für öffentliche Nutzung.
