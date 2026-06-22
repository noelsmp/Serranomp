# Einsatzplanung – Power App

Digitale Einsatzplanung für **Werkstofftechnik (WT)**, **GWQ**, **SGQ** und **GMA**.

---

## Enthaltene Screens

| Screen | Funktion |
|---|---|
| **HomeScreen** | Dashboard: Begrüßung, "Heute hast du X Einsätze", eigene + alle Einsätze heute |
| **EinsatzlisteScreen** | Gefilterte Liste (nach Firma, Datum), Erstellen/Bearbeiten/Löschen |
| **EinsatzFormScreen** | Formular – Prüfer-Feld erscheint **nur** bei Firma = WT |
| **TageszettelScreen** | Tages- oder Wochenzettel pro Firma, Druck (PDF) & E-Mail-Versand |
| **AdminScreen** | Gesamtübersicht aller Einsätze, Statistiken, Export-Vorbereitung |

---

## Felder pro Einsatz

| Feld | Pflicht | Hinweis |
|---|---|---|
| Arbeitsnummer | ✓ | z. B. WT-2024-007 |
| Datum | ✓ | |
| Uhrzeit | ✓ | Format HH:MM |
| Ort / Adresse | ✓ | |
| Firma | ✓ | WT / GWQ / SGQ / GMA |
| Prüfer (E-Mail) | nur WT | bei Partnerfirmen nicht sichtbar |
| Beschreibung | ✓ | Prüfart, Norm, Besonderheiten |
| Ansprechpartner | – | |
| Telefonnummer | – | |
| Status | – | Geplant / Abgeschlossen / Abgesagt |

---

## Import in Power Apps

### Option A – Power Apps CLI (empfohlen)

```bash
# 1. CLI installieren (einmalig)
npm install -g @microsoft/powerplatform-cli
# oder: winget install Microsoft.PowerAppsCLI

# 2. App aus YAML-Quellen packen
pac canvas pack --sources ./pkgs/Src --msapp Einsatzplanung_import.msapp

# 3. Einsatzplanung_import.msapp in Power Apps Studio importieren:
#    make.powerapps.com → Apps → Importieren → .msapp hochladen
```

### Option B – Direkt importieren (testen)

1. `Einsatzplanung.msapp` auf `make.powerapps.com` hochladen
2. **Apps → Importieren → Canvas-App** → Datei wählen
3. Falls Fehlermeldung: Option A verwenden

### Option C – Manuell in Power Apps Studio

Die YAML-Dateien im Ordner `pkgs/Src/Screens/` enthalten alle Formeln.
In Power Apps Studio jede Datei als Vorlage für Screen & Steuerelemente verwenden.

---

## Datenquelle einrichten (SharePoint)

Die App läuft sofort mit **Demo-Daten**. Für echte Datenpersistenz:

### 1. SharePoint-Liste anlegen

**Listenname:** `Einsaetze` (in einer SharePoint-Site Ihrer Wahl)

| Spaltenname | Typ | Hinweis |
|---|---|---|
| Arbeitsnummer | Einzeiligen Text | |
| Datum | Datum und Uhrzeit | nur Datum |
| Uhrzeit | Einzeiligen Text | Format HH:MM |
| Ort | Einzeiligen Text | |
| Pruefer | Einzeiligen Text | E-Mail des Prüfers |
| PrueferName | Einzeiligen Text | |
| Firma | Auswahl | WT; GWQ; SGQ; GMA |
| Beschreibung | Mehrzeiliger Text | |
| Ansprechpartner | Einzeiligen Text | |
| Telefon | Einzeiligen Text | |
| Status | Auswahl | Geplant; Abgeschlossen; Abgesagt |

### 2. Verbindung in App eintragen

In Power Apps Studio die SharePoint-Datenquelle hinzufügen,
dann in `App.fx.yaml` (OnStart) den Demo-Block ersetzen durch:

```
ClearCollect(colEinsaetze, Einsaetze);
```

---

## E-Mail / PDF-Versand einrichten (Power Automate)

### Flow erstellen: "Einsatzplanung E-Mail"

1. **Power Automate** → Neuer Flow → **Sofort/Manuell** (von Power Apps auslösbar)
2. Trigger: **Power Apps (V2)**
3. Eingaben definieren:
   - `EmpfaengerEmail` (Text)
   - `Firma` (Text)
   - `Zeitraum` (Text)
   - `EinsaetzeJSON` (Text)
4. Aktion: **Office 365 Outlook – E-Mail senden**
   - An: `EmpfaengerEmail`
   - Betreff: `Einsatzplanung [Firma] – [Zeitraum]`
   - Text (HTML): Tabelle aus `EinsaetzeJSON` aufbauen
5. Optional: **OneDrive/SharePoint – Datei erstellen** für PDF

### Flow in App einbinden

In Power Apps Studio:
- Daten → Power Automate → Flow hinzufügen
- Im TageszettelScreen Button `E-Mail senden` den Kommentar
  durch den echten Flow-Aufruf ersetzen:

```
EinsatzplanungEmailFlow.Run(
    tiEmailTo.Text,
    varTZFirma,
    Text(varTZDatum, "[$-de-DE]DD.MM.YYYY"),
    varTZMode,
    JSON(galTZEinsaetze.AllItems)
)
```

---

## Firmen-Logik

| Firma | Prüfer-Feld | Wer plant |
|---|---|---|
| **WT** | ✓ sichtbar | Wir weisen Prüfer zu |
| **GWQ** | ✗ ausgeblendet | GWQ bestimmt selbst |
| **SGQ** | ✗ ausgeblendet | SGQ bestimmt selbst |
| **GMA** | ✗ ausgeblendet | GMA bestimmt selbst |

---

## Erweiterungsideen

- **Azure AD / Office 365 Users** als Prüfer-Auswahl (statt Freitext)
- **Benachrichtigungen** per Power Automate wenn neuer Einsatz zugewiesen
- **Dataverse** statt SharePoint für erweiterte Berechtigungen
- **Teams-Integration** für Benachrichtigungen an Prüfer
- **Kalender-Ansicht** (30-Tage-Übersicht)

---

## Dateien

```
Einsatzplanung/
├── Einsatzplanung.msapp          ← Import-Datei
├── generate_app.py               ← Generator (Python 3)
├── README.md                     ← Diese Anleitung
└── pkgs/Src/
    ├── App.fx.yaml               ← OnStart, Demo-Daten
    ├── Screens/
    │   ├── HomeScreen.fx.yaml
    │   ├── EinsatzlisteScreen.fx.yaml
    │   ├── EinsatzFormScreen.fx.yaml
    │   ├── TageszettelScreen.fx.yaml
    │   └── AdminScreen.fx.yaml
    └── References/
        ├── DataSources.json
        └── Resources.json
```
