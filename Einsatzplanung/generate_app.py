#!/usr/bin/env python3
"""
Einsatzplanung Power App Generator
Erstellt eine .msapp-Datei (YAML-Quellformat) fuer Microsoft Power Apps.
Zum direkten Import: pac canvas pack --sources ./src --msapp Einsatzplanung.msapp
Oder YAML-Dateien als Vorlage in Power Apps Studio verwenden.
"""

import zipfile
import json
import uuid
import os
from datetime import datetime, timezone
from io import BytesIO

APP_NAME = "Einsatzplanung"
AUTHOR = "Werkstofftechnik"


# ─────────────────────────────────────────────────────────────────────────────
#  METADATEN
# ─────────────────────────────────────────────────────────────────────────────

CONTENT_TYPES_XML = """<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="yaml" ContentType="text/yaml" />
  <Default Extension="png"  ContentType="image/png" />
  <Default Extension="svg"  ContentType="image/svg+xml" />
</Types>"""

def get_header():
    return json.dumps({
        "PublishVersion": "3.24024.3",
        "SchemaVersion": "1.0",
        "MinimumRequiredSchemaVersion": "1.0"
    }, indent=2)

def get_properties(app_id, file_id, now):
    return json.dumps({
        "PublishVersion": "3.24024.3",
        "SchemaVersion": "1.0",
        "AppName": APP_NAME,
        "LogoFileName": "",
        "Id": app_id,
        "FileID": file_id,
        "LastSavedDateTimeUTC": now,
        "OriginalAppFileName": f"{APP_NAME}.msapp",
        "LocalConnectionReferences": {},
        "LocalDatabaseReferences": {},
        "XmlVersion": "2.1",
        "LayoutWidth": 1366,
        "LayoutHeight": 768,
        "Orientation": "Landscape",
        "DesignedFor": "Tablet",
        "DocumentVersion": "2.1",
        "AppCreationSource": "AppFromScratch",
        "Author": AUTHOR,
        "BackgroundColor": "rgba(0, 84, 166, 1)"
    }, indent=2)

def get_entropy(now):
    return json.dumps({
        "ControlCount": 200,
        "LastUsedDate": now
    }, indent=2)

def get_datasources():
    return json.dumps({
        "ExtensionData": None,
        "DataSources": []
    }, indent=2)

def get_resources():
    return json.dumps({
        "ExtensionData": None,
        "Resources": []
    }, indent=2)

def get_canvas_manifest():
    return json.dumps({
        "FormatVersion": "CanvasManifest/2.0",
        "PublishVersion": "3.24024.3",
        "ScreenOrder": [
            "HomeScreen",
            "EinsatzlisteScreen",
            "EinsatzFormScreen",
            "TageszettelScreen",
            "AdminScreen"
        ],
        "Properties": {
            "DocumentAppType": "CanvasApp"
        }
    }, indent=2)


# ─────────────────────────────────────────────────────────────────────────────
#  APP.FX.YAML  –  Globale Variablen & Demodaten
# ─────────────────────────────────────────────────────────────────────────────

def get_app_yaml():
    return """\
- App:
    Properties:
      OnStart: |-
        =// ──────────────────────────────────────────────────────
        //  Einsatzplanung – App.OnStart
        //  Hier SharePoint-Liste einbinden sobald vorhanden:
        //  ClearCollect(colEinsaetze, EinsaetzeListe);
        //  Bis dahin laufen Demo-Daten.
        // ──────────────────────────────────────────────────────

        // Demo-Daten laden
        ClearCollect(colEinsaetze,
          {
            ID: 1,
            Arbeitsnummer: "WT-2024-001",
            Datum: Today(),
            Uhrzeit: "08:00",
            Ort: "Berlin, Hauptstraße 15",
            Pruefer: User().Email,
            PrueferName: User().FullName,
            Firma: "WT",
            Beschreibung: "Werkstoffprüfung Stahl S355 – Zugversuch und Kerbschlagarbeit",
            Ansprechpartner: "Herr Schmidt",
            Telefon: "030-111 222 33",
            Status: "Geplant"
          },
          {
            ID: 2,
            Arbeitsnummer: "WT-2024-002",
            Datum: Today(),
            Uhrzeit: "13:30",
            Ort: "Hamburg, Industriepark Nord, Halle 5",
            Pruefer: User().Email,
            PrueferName: User().FullName,
            Firma: "WT",
            Beschreibung: "Ultraschallprüfung Aluminiumblech nach EN 10160",
            Ansprechpartner: "Frau Meyer",
            Telefon: "040-333 444 55",
            Status: "Geplant"
          },
          {
            ID: 3,
            Arbeitsnummer: "GWQ-2024-001",
            Datum: Today(),
            Uhrzeit: "09:00",
            Ort: "München, Fabrikstraße 5",
            Pruefer: "",
            PrueferName: "",
            Firma: "GWQ",
            Beschreibung: "Dichtheitstest Rohrsystem DN100",
            Ansprechpartner: "Herr Müller",
            Telefon: "089-555 666 77",
            Status: "Geplant"
          },
          {
            ID: 4,
            Arbeitsnummer: "SGQ-2024-001",
            Datum: DateAdd(Today(), 1, TimeUnit.Days),
            Uhrzeit: "10:00",
            Ort: "Frankfurt, Industriering 12",
            Pruefer: "",
            PrueferName: "",
            Firma: "SGQ",
            Beschreibung: "Qualitätssicherung Schweißnaht WIG nach ISO 5817",
            Ansprechpartner: "Frau Weber",
            Telefon: "069-777 888 99",
            Status: "Geplant"
          },
          {
            ID: 5,
            Arbeitsnummer: "GMA-2024-001",
            Datum: DateAdd(Today(), 2, TimeUnit.Days),
            Uhrzeit: "07:30",
            Ort: "Stuttgart, Technologiepark, Gebäude A",
            Pruefer: "",
            PrueferName: "",
            Firma: "GMA",
            Beschreibung: "Sichtprüfung Oberflächenbeschichtung nach ISO 12944",
            Ansprechpartner: "Herr Braun",
            Telefon: "0711-999 111 22",
            Status: "Geplant"
          },
          {
            ID: 6,
            Arbeitsnummer: "WT-2024-003",
            Datum: DateAdd(Today(), -1, TimeUnit.Days),
            Uhrzeit: "11:00",
            Ort: "Köln, Chempark, Labor 3",
            Pruefer: User().Email,
            PrueferName: User().FullName,
            Firma: "WT",
            Beschreibung: "Härtemessung Rockwell HRC, Stichprobenkontrolle",
            Ansprechpartner: "Herr Fischer",
            Telefon: "0221-444 555 66",
            Status: "Abgeschlossen"
          }
        );

        // Globale Variablen
        Set(varNextID, 7);
        Set(varSelectedFirma, "Alle");
        Set(varSelectedDate, Today());
        Set(varDateRangeStart, Today());
        Set(varDateRangeEnd, DateAdd(Today(), 6, TimeUnit.Days));
        Set(varReportMode, "Tag");
        Set(varEditMode, false);
        Set(varCurrentEinsatz, Blank());
        Set(varFilterFirma, "Alle");
        Set(varFilterDatum, Today());
        Navigate(HomeScreen, ScreenTransition.None)
"""


# ─────────────────────────────────────────────────────────────────────────────
#  HOME SCREEN  –  Dashboard mit Tagesübersicht
# ─────────────────────────────────────────────────────────────────────────────

def get_home_screen():
    return """\
- HomeScreen:
    Properties:
      Fill: =RGBA(245, 247, 250, 1)

    Children:

    # ── Header Bar ──────────────────────────────────────────────────────────
    - rectHeader:
        Control: Rectangle
        Properties:
          Fill: =RGBA(0, 84, 166, 1)
          X: =0
          Y: =0
          Width: =Parent.Width
          Height: =64

    - lblAppTitle:
        Control: Label
        Properties:
          Text: ="⚙ Einsatzplanung"
          Color: =RGBA(255, 255, 255, 1)
          Size: =20
          FontWeight: =FontWeight.Bold
          X: =20
          Y: =0
          Width: =500
          Height: =64
          VerticalAlign: =VerticalAlign.Middle

    - lblUserHeader:
        Control: Label
        Properties:
          Text: =User().FullName
          Color: =RGBA(200, 225, 255, 1)
          Size: =12
          X: =Parent.Width - 250
          Y: =0
          Width: =240
          Height: =64
          Align: =Align.Right
          VerticalAlign: =VerticalAlign.Middle

    # ── Begrüßungskarte ─────────────────────────────────────────────────────
    - rectGreetCard:
        Control: Rectangle
        Properties:
          Fill: =RGBA(255, 255, 255, 1)
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =1
          RadiusTopLeft: =10
          RadiusTopRight: =10
          RadiusBottomLeft: =10
          RadiusBottomRight: =10
          X: =20
          Y: =84
          Width: =Parent.Width - 40
          Height: =90
          DropShadow: =DropShadow.Light

    - lblGreeting:
        Control: Label
        Properties:
          Text: ="Hallo, " & User().FullName & "!"
          Color: =RGBA(0, 84, 166, 1)
          Size: =20
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =96
          Width: =Parent.Width - 80
          Height: =36

    - lblDateToday:
        Control: Label
        Properties:
          Text: =Text(Today(), "[$-de-DE]DDDD, D. MMMM YYYY")
          Color: =RGBA(100, 110, 130, 1)
          Size: =13
          X: =40
          Y: =134
          Width: =Parent.Width - 80
          Height: =28

    # ── Heute-Info-Box ───────────────────────────────────────────────────────
    - rectTodayBox:
        Control: Rectangle
        Properties:
          Fill: =If(
              CountRows(Filter(colEinsaetze, DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) = Today() && Lower(Pruefer) = Lower(User().Email))) = 0,
              RGBA(240, 245, 255, 1),
              RGBA(0, 84, 166, 0.08)
            )
          BorderColor: =RGBA(0, 84, 166, 1)
          BorderThickness: =2
          RadiusTopLeft: =10
          RadiusTopRight: =10
          RadiusBottomLeft: =10
          RadiusBottomRight: =10
          X: =20
          Y: =194
          Width: =Parent.Width - 40
          Height: =80

    - lblTodayCount:
        Control: Label
        Properties:
          Text: =With(
              {cnt: CountRows(Filter(colEinsaetze, DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) = Today() && Lower(Pruefer) = Lower(User().Email)))},
              If(cnt = 0,
                "Heute keine eigenen Einsätze geplant.",
                "📋  Heute hast du " & cnt & If(cnt = 1, " Einsatz", " Einsätze") & " geplant."
              )
            )
          Color: =RGBA(0, 84, 166, 1)
          Size: =17
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =214
          Width: =Parent.Width - 80
          Height: =42

    # ── Meine heutigen Einsätze ─────────────────────────────────────────────
    - lblMyEinsaetze:
        Control: Label
        Properties:
          Text: ="Meine Einsätze heute"
          Color: =RGBA(50, 60, 80, 1)
          Size: =14
          FontWeight: =FontWeight.Bold
          X: =20
          Y: =294
          Width: =400
          Height: =28

    - galMyToday:
        Control: Gallery
        Variant: BrowseLayout_Vertical_TwoTextOneImageVariant_ver5.0
        Properties:
          Items: =SortByColumns(
              Filter(colEinsaetze,
                DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) = Today() &&
                Lower(Pruefer) = Lower(User().Email)
              ),
              "Uhrzeit", SortOrder.Ascending
            )
          X: =0
          Y: =328
          Width: =Parent.Width
          Height: =260
          TemplateSize: =85
          ShowScrollbar: =true
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =0

        Children:
        - rectGalItem:
            Control: Rectangle
            Properties:
              Fill: =RGBA(255, 255, 255, 1)
              BorderColor: =RGBA(220, 228, 238, 1)
              BorderThickness: =1
              X: =10
              Y: =4
              Width: =Parent.Width - 20
              Height: =76
              RadiusTopLeft: =8
              RadiusTopRight: =8
              RadiusBottomLeft: =8
              RadiusBottomRight: =8

        - lblGalOrt:
            Control: Label
            Properties:
              Text: =ThisItem.Uhrzeit & "  –  " & ThisItem.Ort
              Color: =RGBA(30, 40, 60, 1)
              Size: =14
              FontWeight: =FontWeight.Bold
              X: =24
              Y: =12
              Width: =Parent.Width - 160
              Height: =28

        - lblGalBeschreibung:
            Control: Label
            Properties:
              Text: =ThisItem.Beschreibung
              Color: =RGBA(80, 90, 110, 1)
              Size: =12
              X: =24
              Y: =42
              Width: =Parent.Width - 160
              Height: =24
              Overflow: =Overflow.Hidden

        - lblGalFirma:
            Control: Label
            Properties:
              Text: =ThisItem.Firma
              Color: =RGBA(255, 255, 255, 1)
              Size: =12
              FontWeight: =FontWeight.Bold
              Fill: =Switch(ThisItem.Firma,
                  "WT",  RGBA(0, 84, 166, 1),
                  "GWQ", RGBA(0, 140, 80, 1),
                  "SGQ", RGBA(180, 60, 0, 1),
                  "GMA", RGBA(120, 30, 150, 1),
                  RGBA(100, 100, 100, 1)
                )
              X: =Parent.Width - 130
              Y: =24
              Width: =100
              Height: =28
              Align: =Align.Center
              VerticalAlign: =VerticalAlign.Middle
              RadiusTopLeft: =6
              RadiusTopRight: =6
              RadiusBottomLeft: =6
              RadiusBottomRight: =6

        - lblGalArbNr:
            Control: Label
            Properties:
              Text: =ThisItem.Arbeitsnummer
              Color: =RGBA(100, 110, 130, 1)
              Size: =11
              X: =Parent.Width - 130
              Y: =56
              Width: =100
              Height: =20
              Align: =Align.Center

    # ── Alle Einsätze heute (auch Partnerfirmen) ────────────────────────────
    - lblAllToday:
        Control: Label
        Properties:
          Text: ="Alle Einsätze heute (" & CountRows(Filter(colEinsaetze, DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) = Today())) & ")"
          Color: =RGBA(50, 60, 80, 1)
          Size: =14
          FontWeight: =FontWeight.Bold
          X: =20
          Y: =600
          Width: =500
          Height: =28

    - galAllToday:
        Control: Gallery
        Variant: BrowseLayout_Vertical_TwoTextOneImageVariant_ver5.0
        Properties:
          Items: =SortByColumns(
              Filter(colEinsaetze, DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) = Today()),
              "Firma", SortOrder.Ascending,
              "Uhrzeit", SortOrder.Ascending
            )
          X: =0
          Y: =634
          Width: =Parent.Width
          Height: =80
          TemplateSize: =72
          ShowScrollbar: =true

        Children:
        - lblAllGalLine:
            Control: Label
            Properties:
              Text: =ThisItem.Uhrzeit & "  " & ThisItem.Firma & "  –  " & ThisItem.Ort & "  |  " & ThisItem.Ansprechpartner
              Color: =RGBA(50, 60, 80, 1)
              Size: =12
              X: =20
              Y: =10
              Width: =Parent.Width - 40
              Height: =24

        - lblAllGalArbNr:
            Control: Label
            Properties:
              Text: ="Nr: " & ThisItem.Arbeitsnummer & "  |  " & ThisItem.Beschreibung
              Color: =RGBA(100, 110, 130, 1)
              Size: =11
              X: =20
              Y: =36
              Width: =Parent.Width - 40
              Height: =22
              Overflow: =Overflow.Hidden

        - rectAllSep:
            Control: Rectangle
            Properties:
              Fill: =RGBA(220, 228, 238, 1)
              X: =0
              Y: =70
              Width: =Parent.Width
              Height: =1

    # ── Navigation ──────────────────────────────────────────────────────────
    - rectNavBar:
        Control: Rectangle
        Properties:
          Fill: =RGBA(255, 255, 255, 1)
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =1
          X: =0
          Y: =Parent.Height - 70
          Width: =Parent.Width
          Height: =70

    - btnNavEinsaetze:
        Control: Button
        Properties:
          Text: ="📋  Alle Einsätze"
          Fill: =RGBA(0, 84, 166, 1)
          HoverFill: =RGBA(0, 64, 136, 1)
          PressedFill: =RGBA(0, 44, 106, 1)
          Color: =RGBA(255, 255, 255, 1)
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20
          Y: =Parent.Height - 58
          Width: =(Parent.Width - 60) / 3
          Height: =46
          FontSize: =13
          OnSelect: =Navigate(EinsatzlisteScreen, ScreenTransition.Fade)

    - btnNavTageszettel:
        Control: Button
        Properties:
          Text: ="📄  Tageszettel"
          Fill: =RGBA(0, 130, 70, 1)
          HoverFill: =RGBA(0, 110, 55, 1)
          PressedFill: =RGBA(0, 90, 40, 1)
          Color: =RGBA(255, 255, 255, 1)
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20 + (Parent.Width - 60) / 3 + 10
          Y: =Parent.Height - 58
          Width: =(Parent.Width - 60) / 3
          Height: =46
          FontSize: =13
          OnSelect: =Navigate(TageszettelScreen, ScreenTransition.Fade)

    - btnNavAdmin:
        Control: Button
        Properties:
          Text: ="⚙  Verwaltung"
          Fill: =RGBA(80, 90, 110, 1)
          HoverFill: =RGBA(60, 70, 90, 1)
          PressedFill: =RGBA(40, 50, 70, 1)
          Color: =RGBA(255, 255, 255, 1)
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20 + 2 * ((Parent.Width - 60) / 3 + 10)
          Y: =Parent.Height - 58
          Width: =(Parent.Width - 60) / 3
          Height: =46
          FontSize: =13
          OnSelect: =Navigate(AdminScreen, ScreenTransition.Fade)
"""


# ─────────────────────────────────────────────────────────────────────────────
#  EINSATZLISTE SCREEN  –  Gefilterte Liste aller Einsätze
# ─────────────────────────────────────────────────────────────────────────────

def get_einsatzliste_screen():
    return """\
- EinsatzlisteScreen:
    Properties:
      Fill: =RGBA(245, 247, 250, 1)
      OnVisible: =Set(varFilterFirma, "Alle"); Set(varFilterDatum, Blank())

    Children:

    # ── Header ──────────────────────────────────────────────────────────────
    - rectELHeader:
        Control: Rectangle
        Properties:
          Fill: =RGBA(0, 84, 166, 1)
          X: =0
          Y: =0
          Width: =Parent.Width
          Height: =64

    - btnELBack:
        Control: Button
        Properties:
          Text: ="← Zurück"
          Fill: =RGBA(0, 0, 0, 0)
          HoverFill: =RGBA(255, 255, 255, 0.15)
          PressedFill: =RGBA(255, 255, 255, 0.25)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          X: =10
          Y: =12
          Width: =110
          Height: =40
          FontSize: =13
          OnSelect: =Navigate(HomeScreen, ScreenTransition.Fade)

    - lblELTitle:
        Control: Label
        Properties:
          Text: ="Alle Einsätze"
          Color: =RGBA(255, 255, 255, 1)
          Size: =20
          FontWeight: =FontWeight.Bold
          X: =130
          Y: =0
          Width: =400
          Height: =64
          VerticalAlign: =VerticalAlign.Middle

    - lblELCount:
        Control: Label
        Properties:
          Text: =CountRows(galEinsaetze.AllItems) & " Einträge"
          Color: =RGBA(200, 220, 255, 1)
          Size: =12
          X: =Parent.Width - 160
          Y: =0
          Width: =150
          Height: =64
          Align: =Align.Right
          VerticalAlign: =VerticalAlign.Middle

    # ── Firma-Filter Buttons ─────────────────────────────────────────────────
    - rectFilterBar:
        Control: Rectangle
        Properties:
          Fill: =RGBA(255, 255, 255, 1)
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =1
          X: =0
          Y: =64
          Width: =Parent.Width
          Height: =56

    - btnFAll:
        Control: Button
        Properties:
          Text: ="Alle"
          Fill: =If(varFilterFirma = "Alle", RGBA(0, 84, 166, 1), RGBA(240, 244, 252, 1))
          HoverFill: =If(varFilterFirma = "Alle", RGBA(0, 64, 136, 1), RGBA(220, 230, 248, 1))
          Color: =If(varFilterFirma = "Alle", RGBA(255,255,255,1), RGBA(0, 84, 166, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =10
          Y: =72
          Width: =60
          Height: =32
          FontSize: =12
          OnSelect: =Set(varFilterFirma, "Alle")

    - btnFWT:
        Control: Button
        Properties:
          Text: ="WT"
          Fill: =If(varFilterFirma = "WT", RGBA(0, 84, 166, 1), RGBA(240, 244, 252, 1))
          HoverFill: =If(varFilterFirma = "WT", RGBA(0, 64, 136, 1), RGBA(220, 230, 248, 1))
          Color: =If(varFilterFirma = "WT", RGBA(255,255,255,1), RGBA(0, 84, 166, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =80
          Y: =72
          Width: =60
          Height: =32
          FontSize: =12
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varFilterFirma, "WT")

    - btnFGWQ:
        Control: Button
        Properties:
          Text: ="GWQ"
          Fill: =If(varFilterFirma = "GWQ", RGBA(0, 140, 80, 1), RGBA(240, 252, 244, 1))
          HoverFill: =If(varFilterFirma = "GWQ", RGBA(0, 110, 60, 1), RGBA(210, 248, 224, 1))
          Color: =If(varFilterFirma = "GWQ", RGBA(255,255,255,1), RGBA(0, 140, 80, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =150
          Y: =72
          Width: =60
          Height: =32
          FontSize: =12
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varFilterFirma, "GWQ")

    - btnFSGQ:
        Control: Button
        Properties:
          Text: ="SGQ"
          Fill: =If(varFilterFirma = "SGQ", RGBA(180, 60, 0, 1), RGBA(255, 244, 238, 1))
          HoverFill: =If(varFilterFirma = "SGQ", RGBA(150, 40, 0, 1), RGBA(255, 228, 216, 1))
          Color: =If(varFilterFirma = "SGQ", RGBA(255,255,255,1), RGBA(180, 60, 0, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =220
          Y: =72
          Width: =60
          Height: =32
          FontSize: =12
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varFilterFirma, "SGQ")

    - btnFGMA:
        Control: Button
        Properties:
          Text: ="GMA"
          Fill: =If(varFilterFirma = "GMA", RGBA(120, 30, 150, 1), RGBA(248, 240, 252, 1))
          HoverFill: =If(varFilterFirma = "GMA", RGBA(90, 20, 120, 1), RGBA(236, 216, 248, 1))
          Color: =If(varFilterFirma = "GMA", RGBA(255,255,255,1), RGBA(120, 30, 150, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =290
          Y: =72
          Width: =60
          Height: =32
          FontSize: =12
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varFilterFirma, "GMA")

    # ── Datum-Filter ─────────────────────────────────────────────────────────
    - lblDateFilter:
        Control: Label
        Properties:
          Text: ="Datum:"
          Color: =RGBA(80, 90, 110, 1)
          Size: =12
          X: =400
          Y: =72
          Width: =50
          Height: =32
          VerticalAlign: =VerticalAlign.Middle

    - dpFilterDate:
        Control: DatePicker
        Properties:
          SelectedDate: =varFilterDatum
          X: =452
          Y: =72
          Width: =180
          Height: =32
          OnChange: =Set(varFilterDatum, Self.SelectedDate)
          Format: =DateTimeFormat.ShortDate

    - btnClearDate:
        Control: Button
        Properties:
          Text: ="✕ Datum löschen"
          Fill: =RGBA(240, 244, 252, 1)
          HoverFill: =RGBA(220, 228, 250, 1)
          Color: =RGBA(0, 84, 166, 1)
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =642
          Y: =72
          Width: =130
          Height: =32
          FontSize: =11
          Visible: =!IsBlank(varFilterDatum)
          OnSelect: =Set(varFilterDatum, Blank())

    # ── Neuer Einsatz Button ─────────────────────────────────────────────────
    - btnNewEinsatz:
        Control: Button
        Properties:
          Text: ="＋  Neuer Einsatz"
          Fill: =RGBA(0, 140, 80, 1)
          HoverFill: =RGBA(0, 110, 60, 1)
          PressedFill: =RGBA(0, 90, 45, 1)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =Parent.Width - 190
          Y: =72
          Width: =170
          Height: =32
          FontSize: =13
          OnSelect: =
            Set(varEditMode, false);
            Set(varCurrentEinsatz, {
              ID: varNextID,
              Arbeitsnummer: "",
              Datum: Today(),
              Uhrzeit: "08:00",
              Ort: "",
              Pruefer: "",
              PrueferName: "",
              Firma: If(varFilterFirma = "Alle", "WT", varFilterFirma),
              Beschreibung: "",
              Ansprechpartner: "",
              Telefon: "",
              Status: "Geplant"
            });
            Navigate(EinsatzFormScreen, ScreenTransition.Cover)

    # ── Einsätze-Galerie ─────────────────────────────────────────────────────
    - galEinsaetze:
        Control: Gallery
        Variant: BrowseLayout_Vertical_TwoTextOneImageVariant_ver5.0
        Properties:
          Items: =SortByColumns(
              Filter(colEinsaetze,
                (varFilterFirma = "Alle" || Firma = varFilterFirma) &&
                (IsBlank(varFilterDatum) || DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) = varFilterDatum)
              ),
              "Datum", SortOrder.Ascending,
              "Uhrzeit", SortOrder.Ascending
            )
          X: =0
          Y: =124
          Width: =Parent.Width
          Height: =Parent.Height - 124
          TemplateSize: =110
          ShowScrollbar: =true

        Children:
        - rectEinsatzCard:
            Control: Rectangle
            Properties:
              Fill: =RGBA(255, 255, 255, 1)
              BorderColor: =RGBA(220, 228, 238, 1)
              BorderThickness: =1
              RadiusTopLeft: =8
              RadiusTopRight: =8
              RadiusBottomLeft: =8
              RadiusBottomRight: =8
              X: =12
              Y: =5
              Width: =Parent.Width - 24
              Height: =98
              DropShadow: =DropShadow.Light

        - lblEFirmaChip:
            Control: Label
            Properties:
              Text: =ThisItem.Firma
              Color: =RGBA(255, 255, 255, 1)
              Size: =11
              FontWeight: =FontWeight.Bold
              Fill: =Switch(ThisItem.Firma,
                  "WT",  RGBA(0, 84, 166, 1),
                  "GWQ", RGBA(0, 140, 80, 1),
                  "SGQ", RGBA(180, 60, 0, 1),
                  "GMA", RGBA(120, 30, 150, 1),
                  RGBA(100, 100, 100, 1)
                )
              X: =24
              Y: =13
              Width: =50
              Height: =22
              Align: =Align.Center
              VerticalAlign: =VerticalAlign.Middle
              RadiusTopLeft: =5
              RadiusTopRight: =5
              RadiusBottomLeft: =5
              RadiusBottomRight: =5

        - lblEArbNr:
            Control: Label
            Properties:
              Text: =ThisItem.Arbeitsnummer
              Color: =RGBA(80, 90, 110, 1)
              Size: =11
              X: =82
              Y: =13
              Width: =200
              Height: =22

        - lblEStatus:
            Control: Label
            Properties:
              Text: =ThisItem.Status
              Color: =Switch(ThisItem.Status,
                  "Geplant", RGBA(0, 84, 166, 1),
                  "Abgeschlossen", RGBA(0, 140, 80, 1),
                  "Abgesagt", RGBA(200, 0, 0, 1),
                  RGBA(100, 100, 100, 1)
                )
              Size: =11
              X: =Parent.Width - 150
              Y: =13
              Width: =110
              Height: =22
              Align: =Align.Right

        - lblEOrt:
            Control: Label
            Properties:
              Text: =Text(ThisItem.Datum, "[$-de-DE]DD.MM.YY") & "  " & ThisItem.Uhrzeit & "  –  " & ThisItem.Ort
              Color: =RGBA(20, 30, 50, 1)
              Size: =14
              FontWeight: =FontWeight.Bold
              X: =24
              Y: =38
              Width: =Parent.Width - 48
              Height: =28
              Overflow: =Overflow.Hidden

        - lblEBeschreibung:
            Control: Label
            Properties:
              Text: =ThisItem.Beschreibung
              Color: =RGBA(80, 90, 110, 1)
              Size: =12
              X: =24
              Y: =68
              Width: =(Parent.Width - 48) * 0.6
              Height: =24
              Overflow: =Overflow.Hidden

        - lblEAnsprechpartner:
            Control: Label
            Properties:
              Text: =ThisItem.Ansprechpartner & "  " & ThisItem.Telefon
              Color: =RGBA(80, 90, 110, 1)
              Size: =12
              X: =24 + (Parent.Width - 48) * 0.6 + 10
              Y: =68
              Width: =(Parent.Width - 48) * 0.4 - 20
              Height: =24

        - btnEditEinsatz:
            Control: Button
            Properties:
              Text: ="✎ Bearbeiten"
              Fill: =RGBA(240, 244, 252, 1)
              HoverFill: =RGBA(210, 225, 248, 1)
              Color: =RGBA(0, 84, 166, 1)
              BorderThickness: =0
              RadiusTopLeft: =6
              RadiusTopRight: =6
              RadiusBottomLeft: =6
              RadiusBottomRight: =6
              X: =Parent.Width - 180
              Y: =65
              Width: =120
              Height: =28
              FontSize: =11
              OnSelect: =
                Set(varEditMode, true);
                Set(varCurrentEinsatz, ThisItem);
                Navigate(EinsatzFormScreen, ScreenTransition.Cover)

        - btnDeleteEinsatz:
            Control: Button
            Properties:
              Text: ="🗑"
              Fill: =RGBA(255, 244, 244, 1)
              HoverFill: =RGBA(255, 220, 220, 1)
              Color: =RGBA(200, 0, 0, 1)
              BorderThickness: =0
              RadiusTopLeft: =6
              RadiusTopRight: =6
              RadiusBottomLeft: =6
              RadiusBottomRight: =6
              X: =Parent.Width - 52
              Y: =65
              Width: =30
              Height: =28
              FontSize: =13
              OnSelect: =
                If(
                  Confirm("Einsatz " & ThisItem.Arbeitsnummer & " wirklich löschen?"),
                  Remove(colEinsaetze, ThisItem)
                )
"""


# ─────────────────────────────────────────────────────────────────────────────
#  EINSATZ FORM SCREEN  –  Erstellen / Bearbeiten
# ─────────────────────────────────────────────────────────────────────────────

def get_einsatzform_screen():
    return """\
- EinsatzFormScreen:
    Properties:
      Fill: =RGBA(245, 247, 250, 1)

    Children:

    # ── Header ──────────────────────────────────────────────────────────────
    - rectEFHeader:
        Control: Rectangle
        Properties:
          Fill: =RGBA(0, 84, 166, 1)
          X: =0
          Y: =0
          Width: =Parent.Width
          Height: =64

    - btnEFBack:
        Control: Button
        Properties:
          Text: ="← Abbrechen"
          Fill: =RGBA(0, 0, 0, 0)
          HoverFill: =RGBA(255, 255, 255, 0.15)
          PressedFill: =RGBA(255, 255, 255, 0.25)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          X: =10
          Y: =12
          Width: =120
          Height: =40
          FontSize: =13
          OnSelect: =Navigate(EinsatzlisteScreen, ScreenTransition.UnCover)

    - lblEFTitle:
        Control: Label
        Properties:
          Text: =If(varEditMode, "Einsatz bearbeiten", "Neuer Einsatz")
          Color: =RGBA(255, 255, 255, 1)
          Size: =20
          FontWeight: =FontWeight.Bold
          X: =140
          Y: =0
          Width: =500
          Height: =64
          VerticalAlign: =VerticalAlign.Middle

    # ── Formular ─────────────────────────────────────────────────────────────
    - rectFormCard:
        Control: Rectangle
        Properties:
          Fill: =RGBA(255, 255, 255, 1)
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =1
          RadiusTopLeft: =10
          RadiusTopRight: =10
          RadiusBottomLeft: =10
          RadiusBottomRight: =10
          X: =20
          Y: =80
          Width: =Parent.Width - 40
          Height: =Parent.Height - 160
          DropShadow: =DropShadow.Light

    # Zeile 1: Arbeitsnummer + Firma
    - lblFArbNr:
        Control: Label
        Properties:
          Text: ="Arbeitsnummer *"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =100
          Width: =280
          Height: =24

    - tiArbNr:
        Control: TextInput
        Properties:
          Default: =varCurrentEinsatz.Arbeitsnummer
          PlaceholderText: ="z.B. WT-2024-007"
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =126
          Width: =280
          Height: =40

    - lblFFirma:
        Control: Label
        Properties:
          Text: ="Firma *"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =340
          Y: =100
          Width: =180
          Height: =24

    - ddFirma:
        Control: Dropdown
        Properties:
          Items: =["WT", "GWQ", "SGQ", "GMA"]
          Default: =varCurrentEinsatz.Firma
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          ChevronBackground: =RGBA(240, 244, 252, 1)
          ChevronFill: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =340
          Y: =126
          Width: =180
          Height: =40

    # Zeile 2: Datum + Uhrzeit
    - lblFDatum:
        Control: Label
        Properties:
          Text: ="Datum *"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =186
          Width: =200
          Height: =24

    - dpFDatum:
        Control: DatePicker
        Properties:
          SelectedDate: =varCurrentEinsatz.Datum
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =212
          Width: =200
          Height: =40

    - lblFUhrzeit:
        Control: Label
        Properties:
          Text: ="Uhrzeit *"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =260
          Y: =186
          Width: =140
          Height: =24

    - tiUhrzeit:
        Control: TextInput
        Properties:
          Default: =varCurrentEinsatz.Uhrzeit
          PlaceholderText: ="08:00"
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =260
          Y: =212
          Width: =140
          Height: =40

    # Status (nur rechts neben Uhrzeit)
    - lblFStatus:
        Control: Label
        Properties:
          Text: ="Status"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =420
          Y: =186
          Width: =150
          Height: =24

    - ddStatus:
        Control: Dropdown
        Properties:
          Items: =["Geplant", "Abgeschlossen", "Abgesagt"]
          Default: =varCurrentEinsatz.Status
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =420
          Y: =212
          Width: =150
          Height: =40

    # Zeile 3: Ort
    - lblFOrt:
        Control: Label
        Properties:
          Text: ="Ort / Adresse *"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =272
          Width: =Parent.Width - 80
          Height: =24

    - tiOrt:
        Control: TextInput
        Properties:
          Default: =varCurrentEinsatz.Ort
          PlaceholderText: ="Stadt, Straße, Gebäude"
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =298
          Width: =Parent.Width - 80
          Height: =40

    # Zeile 4: Prüfer (nur sichtbar wenn Firma = WT)
    - rectPrueferSection:
        Control: Rectangle
        Properties:
          Fill: =RGBA(240, 245, 255, 1)
          BorderColor: =RGBA(0, 84, 166, 0.3)
          BorderThickness: =1
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =358
          Width: =Parent.Width - 80
          Height: =80
          Visible: =ddFirma.Selected.Value = "WT"

    - lblFPrueferHint:
        Control: Label
        Properties:
          Text: ="🔵  WT-Einsatz: Prüfer zuweisen"
          Color: =RGBA(0, 84, 166, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =52
          Y: =366
          Width: =300
          Height: =22
          Visible: =ddFirma.Selected.Value = "WT"

    - lblFPruefer:
        Control: Label
        Properties:
          Text: ="Prüfer (E-Mail oder Name)"
          Color: =RGBA(60, 70, 90, 1)
          Size: =11
          X: =52
          Y: =388
          Width: =200
          Height: =20
          Visible: =ddFirma.Selected.Value = "WT"

    - tiPruefer:
        Control: TextInput
        Properties:
          Default: =varCurrentEinsatz.Pruefer
          PlaceholderText: ="vorname.nachname@firma.de"
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =260
          Y: =384
          Width: =Parent.Width - 300
          Height: =36
          Visible: =ddFirma.Selected.Value = "WT"

    - lblFPartnerHint:
        Control: Label
        Properties:
          Text: ="⚙  Partnerfirma: Prüfer wird von " & ddFirma.Selected.Value & " selbst bestimmt."
          Color: =RGBA(100, 110, 130, 1)
          Size: =12
          FontStyle: =FontStyle.Italic
          X: =40
          Y: =358
          Width: =Parent.Width - 80
          Height: =30
          Visible: =ddFirma.Selected.Value <> "WT"

    # Zeile 5: Beschreibung
    - lblFBeschreibung:
        Control: Label
        Properties:
          Text: ="Beschreibung / Aufgabe *"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =458
          Width: =Parent.Width - 80
          Height: =24

    - tiBeschreibung:
        Control: TextInput
        Properties:
          Default: =varCurrentEinsatz.Beschreibung
          PlaceholderText: ="Art der Prüfung, Norm, Besonderheiten ..."
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =484
          Width: =Parent.Width - 80
          Height: =70
          Mode: =TextMode.MultiLine

    # Zeile 6: Ansprechpartner + Telefon
    - lblFAnsprechpartner:
        Control: Label
        Properties:
          Text: ="Ansprechpartner vor Ort"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =574
          Width: =280
          Height: =24

    - tiAnsprechpartner:
        Control: TextInput
        Properties:
          Default: =varCurrentEinsatz.Ansprechpartner
          PlaceholderText: ="Herr / Frau Muster"
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =600
          Width: =280
          Height: =40

    - lblFTelefon:
        Control: Label
        Properties:
          Text: ="Telefonnummer"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =340
          Y: =574
          Width: =200
          Height: =24

    - tiTelefon:
        Control: TextInput
        Properties:
          Default: =varCurrentEinsatz.Telefon
          PlaceholderText: ="0xx-xxx xxx xx"
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =340
          Y: =600
          Width: =200
          Height: =40

    # ── Speichern / Abbrechen ─────────────────────────────────────────────
    - btnSave:
        Control: Button
        Properties:
          Text: ="✓  Speichern"
          Fill: =RGBA(0, 140, 80, 1)
          HoverFill: =RGBA(0, 110, 60, 1)
          PressedFill: =RGBA(0, 90, 45, 1)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =40
          Y: =Parent.Height - 70
          Width: =200
          Height: =50
          FontSize: =15
          FontWeight: =FontWeight.Bold
          OnSelect: =
            If(tiArbNr.Text = "" || tiOrt.Text = "" || tiBeschreibung.Text = "",
              Notify("Bitte alle Pflichtfelder (*) ausfüllen.", NotificationType.Error),

              If(varEditMode,
                // Update vorhandener Einsatz
                Patch(colEinsaetze,
                  varCurrentEinsatz,
                  {
                    Arbeitsnummer: tiArbNr.Text,
                    Datum: dpFDatum.SelectedDate,
                    Uhrzeit: tiUhrzeit.Text,
                    Ort: tiOrt.Text,
                    Pruefer: If(ddFirma.Selected.Value = "WT", tiPruefer.Text, ""),
                    PrueferName: If(ddFirma.Selected.Value = "WT", tiPruefer.Text, ""),
                    Firma: ddFirma.Selected.Value,
                    Beschreibung: tiBeschreibung.Text,
                    Ansprechpartner: tiAnsprechpartner.Text,
                    Telefon: tiTelefon.Text,
                    Status: ddStatus.Selected.Value
                  }
                ),
                // Neuer Einsatz anlegen
                Collect(colEinsaetze,
                  {
                    ID: varNextID,
                    Arbeitsnummer: tiArbNr.Text,
                    Datum: dpFDatum.SelectedDate,
                    Uhrzeit: tiUhrzeit.Text,
                    Ort: tiOrt.Text,
                    Pruefer: If(ddFirma.Selected.Value = "WT", tiPruefer.Text, ""),
                    PrueferName: If(ddFirma.Selected.Value = "WT", tiPruefer.Text, ""),
                    Firma: ddFirma.Selected.Value,
                    Beschreibung: tiBeschreibung.Text,
                    Ansprechpartner: tiAnsprechpartner.Text,
                    Telefon: tiTelefon.Text,
                    Status: ddStatus.Selected.Value
                  }
                );
                Set(varNextID, varNextID + 1)
              );
              Notify("Einsatz gespeichert.", NotificationType.Success);
              Navigate(EinsatzlisteScreen, ScreenTransition.UnCover)
            )

    - btnCancel:
        Control: Button
        Properties:
          Text: ="Abbrechen"
          Fill: =RGBA(240, 244, 252, 1)
          HoverFill: =RGBA(220, 228, 248, 1)
          Color: =RGBA(80, 90, 110, 1)
          BorderThickness: =0
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =260
          Y: =Parent.Height - 70
          Width: =150
          Height: =50
          FontSize: =14
          OnSelect: =Navigate(EinsatzlisteScreen, ScreenTransition.UnCover)
"""


# ─────────────────────────────────────────────────────────────────────────────
#  TAGESZETTEL SCREEN  –  PDF / E-Mail Versand
# ─────────────────────────────────────────────────────────────────────────────

def get_tageszettel_screen():
    return """\
- TageszettelScreen:
    Properties:
      Fill: =RGBA(245, 247, 250, 1)
      OnVisible: =
        Set(varTZFirma, "WT");
        Set(varTZMode, "Tag");
        Set(varTZDatum, Today());
        Set(varTZWocheStart, Today() - Weekday(Today(), StartOfWeek.Monday) + 1);
        Set(varTZWocheEnd, Today() - Weekday(Today(), StartOfWeek.Monday) + 7)

    Children:

    # ── Header ──────────────────────────────────────────────────────────────
    - rectTZHeader:
        Control: Rectangle
        Properties:
          Fill: =RGBA(0, 84, 166, 1)
          X: =0
          Y: =0
          Width: =Parent.Width
          Height: =64

    - btnTZBack:
        Control: Button
        Properties:
          Text: ="← Zurück"
          Fill: =RGBA(0, 0, 0, 0)
          HoverFill: =RGBA(255, 255, 255, 0.15)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          X: =10
          Y: =12
          Width: =110
          Height: =40
          FontSize: =13
          OnSelect: =Navigate(HomeScreen, ScreenTransition.Fade)

    - lblTZTitle:
        Control: Label
        Properties:
          Text: ="Tageszettel / Bericht"
          Color: =RGBA(255, 255, 255, 1)
          Size: =20
          FontWeight: =FontWeight.Bold
          X: =130
          Y: =0
          Width: =400
          Height: =64
          VerticalAlign: =VerticalAlign.Middle

    # ── Filter-Karte ─────────────────────────────────────────────────────────
    - rectTZFilter:
        Control: Rectangle
        Properties:
          Fill: =RGBA(255, 255, 255, 1)
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =1
          RadiusTopLeft: =10
          RadiusTopRight: =10
          RadiusBottomLeft: =10
          RadiusBottomRight: =10
          X: =20
          Y: =80
          Width: =Parent.Width - 40
          Height: =200
          DropShadow: =DropShadow.Light

    - lblTZFirmaLabel:
        Control: Label
        Properties:
          Text: ="Firma"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =96
          Width: =100
          Height: =24

    - btnTZFWT:
        Control: Button
        Properties:
          Text: ="WT"
          Fill: =If(varTZFirma = "WT", RGBA(0, 84, 166, 1), RGBA(240, 244, 252, 1))
          Color: =If(varTZFirma = "WT", RGBA(255,255,255,1), RGBA(0, 84, 166, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =122
          Width: =70
          Height: =34
          FontSize: =13
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varTZFirma, "WT")

    - btnTZFGWQ:
        Control: Button
        Properties:
          Text: ="GWQ"
          Fill: =If(varTZFirma = "GWQ", RGBA(0, 140, 80, 1), RGBA(240, 252, 244, 1))
          Color: =If(varTZFirma = "GWQ", RGBA(255,255,255,1), RGBA(0, 140, 80, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =120
          Y: =122
          Width: =70
          Height: =34
          FontSize: =13
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varTZFirma, "GWQ")

    - btnTZFSGQ:
        Control: Button
        Properties:
          Text: ="SGQ"
          Fill: =If(varTZFirma = "SGQ", RGBA(180, 60, 0, 1), RGBA(255, 244, 238, 1))
          Color: =If(varTZFirma = "SGQ", RGBA(255,255,255,1), RGBA(180, 60, 0, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =200
          Y: =122
          Width: =70
          Height: =34
          FontSize: =13
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varTZFirma, "SGQ")

    - btnTZFGMA:
        Control: Button
        Properties:
          Text: ="GMA"
          Fill: =If(varTZFirma = "GMA", RGBA(120, 30, 150, 1), RGBA(248, 240, 252, 1))
          Color: =If(varTZFirma = "GMA", RGBA(255,255,255,1), RGBA(120, 30, 150, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =280
          Y: =122
          Width: =70
          Height: =34
          FontSize: =13
          FontWeight: =FontWeight.Bold
          OnSelect: =Set(varTZFirma, "GMA")

    # Zeitraum-Auswahl
    - lblTZZeitraum:
        Control: Label
        Properties:
          Text: ="Zeitraum"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =176
          Width: =100
          Height: =24

    - btnTZTag:
        Control: Button
        Properties:
          Text: ="Tageszettel"
          Fill: =If(varTZMode = "Tag", RGBA(0, 84, 166, 1), RGBA(240, 244, 252, 1))
          Color: =If(varTZMode = "Tag", RGBA(255,255,255,1), RGBA(0, 84, 166, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =40
          Y: =202
          Width: =120
          Height: =34
          FontSize: =12
          OnSelect: =Set(varTZMode, "Tag")

    - btnTZWoche:
        Control: Button
        Properties:
          Text: ="Wochenzettel"
          Fill: =If(varTZMode = "Woche", RGBA(0, 84, 166, 1), RGBA(240, 244, 252, 1))
          Color: =If(varTZMode = "Woche", RGBA(255,255,255,1), RGBA(0, 84, 166, 1))
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =170
          Y: =202
          Width: =120
          Height: =34
          FontSize: =12
          OnSelect: =Set(varTZMode, "Woche")

    - dpTZDatum:
        Control: DatePicker
        Properties:
          SelectedDate: =varTZDatum
          X: =310
          Y: =202
          Width: =180
          Height: =34
          Visible: =varTZMode = "Tag"
          OnChange: =Set(varTZDatum, Self.SelectedDate)

    - lblTZWocheInfo:
        Control: Label
        Properties:
          Text: ="KW " & Text(varTZWocheStart, "[$-de-DE]WW") & " | " & Text(varTZWocheStart, "[$-de-DE]DD.MM.") & " – " & Text(varTZWocheEnd, "[$-de-DE]DD.MM.YYYY")
          Color: =RGBA(0, 84, 166, 1)
          Size: =13
          FontWeight: =FontWeight.Bold
          X: =310
          Y: =202
          Width: =300
          Height: =34
          VerticalAlign: =VerticalAlign.Middle
          Visible: =varTZMode = "Woche"

    - btnTZPrevWeek:
        Control: Button
        Properties:
          Text: ="◀"
          Fill: =RGBA(240, 244, 252, 1)
          Color: =RGBA(0, 84, 166, 1)
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =620
          Y: =202
          Width: =40
          Height: =34
          Visible: =varTZMode = "Woche"
          OnSelect: =
            Set(varTZWocheStart, DateAdd(varTZWocheStart, -7, TimeUnit.Days));
            Set(varTZWocheEnd, DateAdd(varTZWocheEnd, -7, TimeUnit.Days))

    - btnTZNextWeek:
        Control: Button
        Properties:
          Text: ="▶"
          Fill: =RGBA(240, 244, 252, 1)
          Color: =RGBA(0, 84, 166, 1)
          BorderThickness: =0
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =668
          Y: =202
          Width: =40
          Height: =34
          Visible: =varTZMode = "Woche"
          OnSelect: =
            Set(varTZWocheStart, DateAdd(varTZWocheStart, 7, TimeUnit.Days));
            Set(varTZWocheEnd, DateAdd(varTZWocheEnd, 7, TimeUnit.Days))

    # ── Vorschau Titel ────────────────────────────────────────────────────────
    - rectTZPreviewHeader:
        Control: Rectangle
        Properties:
          Fill: =Switch(varTZFirma,
              "WT",  RGBA(0, 84, 166, 1),
              "GWQ", RGBA(0, 140, 80, 1),
              "SGQ", RGBA(180, 60, 0, 1),
              "GMA", RGBA(120, 30, 150, 1),
              RGBA(0, 84, 166, 1)
            )
          X: =20
          Y: =296
          Width: =Parent.Width - 40
          Height: =60
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =0
          RadiusBottomRight: =0

    - lblTZPreviewTitle:
        Control: Label
        Properties:
          Text: =varTZFirma & " – " &
              If(varTZMode = "Tag",
                "Tageszettel " & Text(varTZDatum, "[$-de-DE]DD.MM.YYYY"),
                "Wochenzettel KW " & Text(varTZWocheStart,"[$-de-DE]WW") & " / " & Text(varTZWocheStart,"[$-de-DE]YYYY")
              )
          Color: =RGBA(255, 255, 255, 1)
          Size: =16
          FontWeight: =FontWeight.Bold
          X: =36
          Y: =296
          Width: =Parent.Width - 72
          Height: =60
          VerticalAlign: =VerticalAlign.Middle

    - lblTZCount:
        Control: Label
        Properties:
          Text: =CountRows(galTZEinsaetze.AllItems) & " Einsatz/Einsätze"
          Color: =RGBA(255, 255, 255, 0.8)
          Size: =12
          X: =Parent.Width - 220
          Y: =296
          Width: =180
          Height: =60
          Align: =Align.Right
          VerticalAlign: =VerticalAlign.Middle

    # ── Vorschau Galerie ─────────────────────────────────────────────────────
    - galTZEinsaetze:
        Control: Gallery
        Variant: BrowseLayout_Vertical_TwoTextOneImageVariant_ver5.0
        Properties:
          Items: =SortByColumns(
              Filter(colEinsaetze,
                Firma = varTZFirma &&
                If(varTZMode = "Tag",
                  DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) = varTZDatum,
                  DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) >= varTZWocheStart &&
                  DateValue(Text(Datum,"[$-de-DE]DD.MM.YYYY")) <= varTZWocheEnd
                )
              ),
              "Datum", SortOrder.Ascending,
              "Uhrzeit", SortOrder.Ascending
            )
          X: =20
          Y: =356
          Width: =Parent.Width - 40
          Height: =Parent.Height - 500
          TemplateSize: =120
          ShowScrollbar: =true
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =1
          Fill: =RGBA(255, 255, 255, 1)

        Children:
        - lblTZGalDatum:
            Control: Label
            Properties:
              Text: =Text(ThisItem.Datum, "[$-de-DE]dddd, DD.MM.YYYY") & "  " & ThisItem.Uhrzeit & " Uhr"
              Color: =RGBA(0, 84, 166, 1)
              Size: =13
              FontWeight: =FontWeight.Bold
              X: =12
              Y: =8
              Width: =Parent.Width - 24
              Height: =24

        - lblTZGalArbNr:
            Control: Label
            Properties:
              Text: ="Nr: " & ThisItem.Arbeitsnummer
              Color: =RGBA(80, 90, 110, 1)
              Size: =11
              X: =12
              Y: =34
              Width: =200
              Height: =20

        - lblTZGalOrt:
            Control: Label
            Properties:
              Text: ="📍 " & ThisItem.Ort
              Color: =RGBA(30, 40, 60, 1)
              Size: =12
              X: =12
              Y: =56
              Width: =Parent.Width - 24
              Height: =22
              Overflow: =Overflow.Hidden

        - lblTZGalBeschreibung:
            Control: Label
            Properties:
              Text: =ThisItem.Beschreibung
              Color: =RGBA(80, 90, 110, 1)
              Size: =11
              X: =12
              Y: =80
              Width: =(Parent.Width - 24) * 0.65
              Height: =20
              Overflow: =Overflow.Hidden

        - lblTZGalKontakt:
            Control: Label
            Properties:
              Text: ="📞 " & ThisItem.Ansprechpartner & "  " & ThisItem.Telefon
              Color: =RGBA(80, 90, 110, 1)
              Size: =11
              X: =(Parent.Width - 24) * 0.65 + 16
              Y: =80
              Width: =(Parent.Width - 24) * 0.35
              Height: =20
              Overflow: =Overflow.Hidden

        - rectTZSep:
            Control: Rectangle
            Properties:
              Fill: =RGBA(220, 228, 238, 1)
              X: =0
              Y: =118
              Width: =Parent.Width
              Height: =1

    # ── Aktions-Buttons ───────────────────────────────────────────────────────
    - rectTZActions:
        Control: Rectangle
        Properties:
          Fill: =RGBA(255, 255, 255, 1)
          BorderColor: =RGBA(220, 228, 238, 1)
          BorderThickness: =1
          X: =20
          Y: =Parent.Height - 130
          Width: =Parent.Width - 40
          Height: =110
          RadiusTopLeft: =10
          RadiusTopRight: =10
          RadiusBottomLeft: =10
          RadiusBottomRight: =10
          DropShadow: =DropShadow.Light

    - lblTZEmailTo:
        Control: Label
        Properties:
          Text: ="E-Mail-Empfänger:"
          Color: =RGBA(60, 70, 90, 1)
          Size: =12
          FontWeight: =FontWeight.Bold
          X: =40
          Y: =Parent.Height - 122
          Width: =140
          Height: =24

    - tiEmailTo:
        Control: TextInput
        Properties:
          Default: =""
          PlaceholderText: ="empfaenger@partnerfirma.de"
          BorderColor: =RGBA(180, 195, 220, 1)
          FocusedBorderColor: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =6
          RadiusTopRight: =6
          RadiusBottomLeft: =6
          RadiusBottomRight: =6
          X: =190
          Y: =Parent.Height - 126
          Width: =360
          Height: =32

    - btnTZSendEmail:
        Control: Button
        Properties:
          Text: ="📧  E-Mail senden"
          Fill: =RGBA(0, 84, 166, 1)
          HoverFill: =RGBA(0, 64, 136, 1)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =40
          Y: =Parent.Height - 82
          Width: =200
          Height: =50
          FontSize: =14
          FontWeight: =FontWeight.Bold
          OnSelect: =
            If(tiEmailTo.Text = "",
              Notify("Bitte E-Mail-Adresse eingeben.", NotificationType.Warning),

              // Power Automate Flow aufrufen (Flow muss in Power Apps eingebunden werden)
              // Hier Platzhalter – Flow-Verbindung in Power Apps einrichten:
              // EinsatzplanungEmailFlow.Run(
              //   tiEmailTo.Text,
              //   varTZFirma,
              //   Text(varTZDatum, "[$-de-DE]DD.MM.YYYY"),
              //   varTZMode,
              //   JSON(galTZEinsaetze.AllItems)
              // )

              Notify(
                "E-Mail wird vorbereitet für: " & tiEmailTo.Text &
                " (" & CountRows(galTZEinsaetze.AllItems) & " Einsätze)" &
                " – Power Automate Flow einbinden!",
                NotificationType.Information,
                5000
              )
            )

    - btnTZPrint:
        Control: Button
        Properties:
          Text: ="🖨  Drucken / PDF"
          Fill: =RGBA(80, 90, 110, 1)
          HoverFill: =RGBA(60, 70, 90, 1)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =260
          Y: =Parent.Height - 82
          Width: =200
          Height: =50
          FontSize: =14
          OnSelect: =Print()

    - lblTZHint:
        Control: Label
        Properties:
          Text: ="💡 Für PDF-Versand: Power Automate Flow 'Einsatzplanung Email' einbinden (Anleitung im README)"
          Color: =RGBA(100, 110, 130, 1)
          Size: =11
          FontStyle: =FontStyle.Italic
          X: =480
          Y: =Parent.Height - 72
          Width: =Parent.Width - 520
          Height: =40
          VerticalAlign: =VerticalAlign.Middle
"""


# ─────────────────────────────────────────────────────────────────────────────
#  ADMIN SCREEN  –  Gesamtübersicht & Verwaltung
# ─────────────────────────────────────────────────────────────────────────────

def get_admin_screen():
    return """\
- AdminScreen:
    Properties:
      Fill: =RGBA(245, 247, 250, 1)

    Children:

    # ── Header ──────────────────────────────────────────────────────────────
    - rectAdminHeader:
        Control: Rectangle
        Properties:
          Fill: =RGBA(50, 60, 80, 1)
          X: =0
          Y: =0
          Width: =Parent.Width
          Height: =64

    - btnAdminBack:
        Control: Button
        Properties:
          Text: ="← Zurück"
          Fill: =RGBA(0, 0, 0, 0)
          HoverFill: =RGBA(255, 255, 255, 0.15)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          X: =10
          Y: =12
          Width: =110
          Height: =40
          FontSize: =13
          OnSelect: =Navigate(HomeScreen, ScreenTransition.Fade)

    - lblAdminTitle:
        Control: Label
        Properties:
          Text: ="⚙ Verwaltung – Alle Einsätze"
          Color: =RGBA(255, 255, 255, 1)
          Size: =20
          FontWeight: =FontWeight.Bold
          X: =130
          Y: =0
          Width: =600
          Height: =64
          VerticalAlign: =VerticalAlign.Middle

    # ── Stats-Karten ─────────────────────────────────────────────────────────
    - rectStatWT:
        Control: Rectangle
        Properties:
          Fill: =RGBA(0, 84, 166, 1)
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20
          Y: =80
          Width: =(Parent.Width - 80) / 4
          Height: =70

    - lblStatWTN:
        Control: Label
        Properties:
          Text: =CountRows(Filter(colEinsaetze, Firma = "WT"))
          Color: =RGBA(255, 255, 255, 1)
          Size: =28
          FontWeight: =FontWeight.Bold
          X: =20
          Y: =84
          Width: =(Parent.Width - 80) / 4
          Height: =40
          Align: =Align.Center

    - lblStatWTL:
        Control: Label
        Properties:
          Text: ="WT"
          Color: =RGBA(200, 220, 255, 1)
          Size: =12
          X: =20
          Y: =124
          Width: =(Parent.Width - 80) / 4
          Height: =20
          Align: =Align.Center

    - rectStatGWQ:
        Control: Rectangle
        Properties:
          Fill: =RGBA(0, 140, 80, 1)
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20 + (Parent.Width - 80) / 4 + 20
          Y: =80
          Width: =(Parent.Width - 80) / 4
          Height: =70

    - lblStatGWQN:
        Control: Label
        Properties:
          Text: =CountRows(Filter(colEinsaetze, Firma = "GWQ"))
          Color: =RGBA(255, 255, 255, 1)
          Size: =28
          FontWeight: =FontWeight.Bold
          X: =20 + (Parent.Width - 80) / 4 + 20
          Y: =84
          Width: =(Parent.Width - 80) / 4
          Height: =40
          Align: =Align.Center

    - lblStatGWQL:
        Control: Label
        Properties:
          Text: ="GWQ"
          Color: =RGBA(200, 240, 220, 1)
          Size: =12
          X: =20 + (Parent.Width - 80) / 4 + 20
          Y: =124
          Width: =(Parent.Width - 80) / 4
          Height: =20
          Align: =Align.Center

    - rectStatSGQ:
        Control: Rectangle
        Properties:
          Fill: =RGBA(180, 60, 0, 1)
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20 + 2 * ((Parent.Width - 80) / 4 + 20)
          Y: =80
          Width: =(Parent.Width - 80) / 4
          Height: =70

    - lblStatSGQN:
        Control: Label
        Properties:
          Text: =CountRows(Filter(colEinsaetze, Firma = "SGQ"))
          Color: =RGBA(255, 255, 255, 1)
          Size: =28
          FontWeight: =FontWeight.Bold
          X: =20 + 2 * ((Parent.Width - 80) / 4 + 20)
          Y: =84
          Width: =(Parent.Width - 80) / 4
          Height: =40
          Align: =Align.Center

    - lblStatSGQL:
        Control: Label
        Properties:
          Text: ="SGQ"
          Color: =RGBA(255, 210, 190, 1)
          Size: =12
          X: =20 + 2 * ((Parent.Width - 80) / 4 + 20)
          Y: =124
          Width: =(Parent.Width - 80) / 4
          Height: =20
          Align: =Align.Center

    - rectStatGMA:
        Control: Rectangle
        Properties:
          Fill: =RGBA(120, 30, 150, 1)
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20 + 3 * ((Parent.Width - 80) / 4 + 20)
          Y: =80
          Width: =(Parent.Width - 80) / 4
          Height: =70

    - lblStatGMAN:
        Control: Label
        Properties:
          Text: =CountRows(Filter(colEinsaetze, Firma = "GMA"))
          Color: =RGBA(255, 255, 255, 1)
          Size: =28
          FontWeight: =FontWeight.Bold
          X: =20 + 3 * ((Parent.Width - 80) / 4 + 20)
          Y: =84
          Width: =(Parent.Width - 80) / 4
          Height: =40
          Align: =Align.Center

    - lblStatGMAL:
        Control: Label
        Properties:
          Text: ="GMA"
          Color: =RGBA(230, 200, 255, 1)
          Size: =12
          X: =20 + 3 * ((Parent.Width - 80) / 4 + 20)
          Y: =124
          Width: =(Parent.Width - 80) / 4
          Height: =20
          Align: =Align.Center

    # ── Export / Aktionen ─────────────────────────────────────────────────────
    - btnAdminExport:
        Control: Button
        Properties:
          Text: ="📊  Excel Export"
          Fill: =RGBA(0, 120, 56, 1)
          HoverFill: =RGBA(0, 96, 44, 1)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =20
          Y: =168
          Width: =200
          Height: =40
          FontSize: =13
          OnSelect: =
            Notify("Export-Funktion: Power Automate Flow einbinden für Excel-Export.", NotificationType.Information, 3000)

    - btnAdminNewEinsatz:
        Control: Button
        Properties:
          Text: ="＋  Neuer Einsatz"
          Fill: =RGBA(0, 84, 166, 1)
          HoverFill: =RGBA(0, 64, 136, 1)
          Color: =RGBA(255, 255, 255, 1)
          BorderThickness: =0
          RadiusTopLeft: =8
          RadiusTopRight: =8
          RadiusBottomLeft: =8
          RadiusBottomRight: =8
          X: =230
          Y: =168
          Width: =200
          Height: =40
          FontSize: =13
          OnSelect: =
            Set(varEditMode, false);
            Set(varCurrentEinsatz, {
              ID: varNextID, Arbeitsnummer: "", Datum: Today(), Uhrzeit: "08:00",
              Ort: "", Pruefer: "", PrueferName: "", Firma: "WT",
              Beschreibung: "", Ansprechpartner: "", Telefon: "", Status: "Geplant"
            });
            Navigate(EinsatzFormScreen, ScreenTransition.Cover)

    # ── Gesamtliste ───────────────────────────────────────────────────────────
    - lblAdminListHeader:
        Control: Label
        Properties:
          Text: ="Alle Einsätze (" & CountRows(colEinsaetze) & " gesamt)"
          Color: =RGBA(50, 60, 80, 1)
          Size: =14
          FontWeight: =FontWeight.Bold
          X: =20
          Y: =220
          Width: =400
          Height: =28

    - galAdminAll:
        Control: Gallery
        Variant: BrowseLayout_Vertical_TwoTextOneImageVariant_ver5.0
        Properties:
          Items: =SortByColumns(colEinsaetze, "Datum", SortOrder.Descending, "Uhrzeit", SortOrder.Ascending)
          X: =0
          Y: =252
          Width: =Parent.Width
          Height: =Parent.Height - 252
          TemplateSize: =72
          ShowScrollbar: =true

        Children:
        - lblAdminGalFirma:
            Control: Label
            Properties:
              Text: =ThisItem.Firma
              Color: =RGBA(255, 255, 255, 1)
              Size: =10
              FontWeight: =FontWeight.Bold
              Fill: =Switch(ThisItem.Firma,
                  "WT",  RGBA(0, 84, 166, 1),
                  "GWQ", RGBA(0, 140, 80, 1),
                  "SGQ", RGBA(180, 60, 0, 1),
                  "GMA", RGBA(120, 30, 150, 1),
                  RGBA(100, 100, 100, 1)
                )
              X: =12
              Y: =10
              Width: =44
              Height: =20
              Align: =Align.Center
              VerticalAlign: =VerticalAlign.Middle
              RadiusTopLeft: =4
              RadiusTopRight: =4
              RadiusBottomLeft: =4
              RadiusBottomRight: =4

        - lblAdminGalMain:
            Control: Label
            Properties:
              Text: =Text(ThisItem.Datum,"[$-de-DE]DD.MM.YY") & "  " & ThisItem.Uhrzeit & "  –  " & ThisItem.Ort & "  |  " & ThisItem.Arbeitsnummer
              Color: =RGBA(30, 40, 60, 1)
              Size: =13
              FontWeight: =FontWeight.Bold
              X: =64
              Y: =8
              Width: =Parent.Width - 200
              Height: =24

        - lblAdminGalSub:
            Control: Label
            Properties:
              Text: =ThisItem.Beschreibung & If(ThisItem.PrueferName <> "", "  |  Prüfer: " & ThisItem.PrueferName, "")
              Color: =RGBA(80, 90, 110, 1)
              Size: =11
              X: =64
              Y: =34
              Width: =Parent.Width - 200
              Height: =20
              Overflow: =Overflow.Hidden

        - lblAdminGalStatus:
            Control: Label
            Properties:
              Text: =ThisItem.Status
              Color: =Switch(ThisItem.Status,
                  "Geplant", RGBA(0, 84, 166, 1),
                  "Abgeschlossen", RGBA(0, 140, 80, 1),
                  "Abgesagt", RGBA(200, 0, 0, 1),
                  RGBA(100, 100, 100, 1)
                )
              Size: =11
              X: =Parent.Width - 130
              Y: =18
              Width: =110
              Height: =22
              Align: =Align.Right

        - btnAdminEdit:
            Control: Button
            Properties:
              Text: ="✎"
              Fill: =RGBA(240, 244, 252, 1)
              Color: =RGBA(0, 84, 166, 1)
              BorderThickness: =0
              RadiusTopLeft: =5
              RadiusTopRight: =5
              RadiusBottomLeft: =5
              RadiusBottomRight: =5
              X: =Parent.Width - 130
              Y: =42
              Width: =36
              Height: =24
              FontSize: =13
              OnSelect: =
                Set(varEditMode, true);
                Set(varCurrentEinsatz, ThisItem);
                Navigate(EinsatzFormScreen, ScreenTransition.Cover)

        - btnAdminDel:
            Control: Button
            Properties:
              Text: ="🗑"
              Fill: =RGBA(255, 244, 244, 1)
              Color: =RGBA(200, 0, 0, 1)
              BorderThickness: =0
              RadiusTopLeft: =5
              RadiusTopRight: =5
              RadiusBottomLeft: =5
              RadiusBottomRight: =5
              X: =Parent.Width - 86
              Y: =42
              Width: =36
              Height: =24
              FontSize: =13
              OnSelect: =
                If(
                  Confirm("Einsatz " & ThisItem.Arbeitsnummer & " löschen?"),
                  Remove(colEinsaetze, ThisItem)
                )

        - rectAdminSep:
            Control: Rectangle
            Properties:
              Fill: =RGBA(220, 228, 238, 1)
              X: =0
              Y: =70
              Width: =Parent.Width
              Height: =1
"""


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN – ZIP ERZEUGEN
# ─────────────────────────────────────────────────────────────────────────────

def generate_app():
    app_id = str(uuid.uuid4()).upper()
    file_id = str(uuid.uuid4()).upper()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    files = {
        "[Content_Types].xml":                       CONTENT_TYPES_XML,
        "Header.json":                               get_header(),
        "Properties.json":                           get_properties(app_id, file_id, now),
        "Entropy.json":                              get_entropy(now),
        "_CanvasManifest.json":                      get_canvas_manifest(),
        "pkgs/Src/App.fx.yaml":                      get_app_yaml(),
        "pkgs/Src/Screens/HomeScreen.fx.yaml":       get_home_screen(),
        "pkgs/Src/Screens/EinsatzlisteScreen.fx.yaml": get_einsatzliste_screen(),
        "pkgs/Src/Screens/EinsatzFormScreen.fx.yaml": get_einsatzform_screen(),
        "pkgs/Src/Screens/TageszettelScreen.fx.yaml": get_tageszettel_screen(),
        "pkgs/Src/Screens/AdminScreen.fx.yaml":      get_admin_screen(),
        "pkgs/Src/References/DataSources.json":      get_datasources(),
        "pkgs/Src/References/Resources.json":        get_resources(),
    }

    buf = BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for filename, content in files.items():
            zf.writestr(filename, content)
    buf.seek(0)
    return buf.read()


if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    msapp_path = os.path.join(out_dir, "Einsatzplanung.msapp")

    data = generate_app()
    with open(msapp_path, "wb") as f:
        f.write(data)

    print(f"✅  Erstellt: {msapp_path}")
    print(f"   Größe:    {len(data):,} Bytes")
    print()
    print("Enthaltene Dateien:")
    import zipfile as zf2
    with zf2.ZipFile(msapp_path) as z:
        for info in z.infolist():
            print(f"   {info.filename:55s}  {info.file_size:>8,} Bytes")
