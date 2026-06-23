const BASE_STYLE = `
  font-family: Georgia, 'Times New Roman', serif;
  background-color: #f9f6f0;
  margin: 0; padding: 0;
`

const CONTAINER_STYLE = `
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #ddd5c8;
  border-radius: 8px;
  overflow: hidden;
`

const HEADER_STYLE = `
  background: #4e6b53;
  padding: 28px 32px;
  text-align: center;
`

const CONTENT_STYLE = `
  padding: 32px;
  color: #2d2d2d;
  line-height: 1.75;
`

const FOOTER_STYLE = `
  background: #f0ebe0;
  padding: 20px 32px;
  text-align: center;
  font-size: 12px;
  color: #6b6b6b;
  border-top: 1px solid #ddd5c8;
`

const BUTTON_STYLE = `
  display: inline-block;
  background: #6b8f71;
  color: #ffffff !important;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 4px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  letter-spacing: 0.05em;
  margin: 16px 0;
`

const BUTTON_DANGER_STYLE = `
  display: inline-block;
  background: #b45309;
  color: #ffffff !important;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 4px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  letter-spacing: 0.05em;
  margin: 16px 0;
`

function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CONTAINER_STYLE}">
    <div style="${HEADER_STYLE}">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: normal; letter-spacing: 0.08em;">
        NATURHEILPRAXIS HILFREICH
      </h1>
      <p style="color: #eaf2eb; margin: 4px 0 0; font-size: 13px; font-family: Arial, sans-serif;">
        Sympathikustherapie &amp; Regulationsmedizin · Moers
      </p>
    </div>
    <div style="${CONTENT_STYLE}">
      ${content}
    </div>
    <div style="${FOOTER_STYLE}">
      <p style="margin: 0 0 4px;">Naturheilpraxis Hilfreich · Moers · <a href="https://naturheilpraxis-hilfreich.de" style="color: #6b8f71;">naturheilpraxis-hilfreich.de</a></p>
      <p style="margin: 0; font-size: 11px;">Diese E-Mail wurde automatisch versandt. Bei Fragen wenden Sie sich direkt an die Praxis.</p>
    </div>
  </div>
</body>
</html>`
}

export function emailNeueRegistrierung(params: {
  vorname: string
  nachname: string
  email: string
  geburtsdatum: string
  telefon: string
  freischaltLink: string
  ablehnungLink: string
}): { subject: string; html: string } {
  const subject = `Neue Patientenregistrierung: ${params.vorname} ${params.nachname}`
  const html = layout(subject, `
    <h2 style="color: #4e6b53; font-size: 18px; margin: 0 0 16px;">Neue Registrierungsanfrage</h2>
    <p>Eine neue Patientin / ein neuer Patient hat sich für das Patientenportal registriert und wartet auf Freischaltung.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr style="border-bottom: 1px solid #ddd5c8;">
        <td style="padding: 10px 0; color: #6b6b6b; width: 40%;">Name</td>
        <td style="padding: 10px 0; font-weight: bold;">${params.vorname} ${params.nachname}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd5c8;">
        <td style="padding: 10px 0; color: #6b6b6b;">E-Mail</td>
        <td style="padding: 10px 0;">${params.email}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd5c8;">
        <td style="padding: 10px 0; color: #6b6b6b;">Geburtsdatum</td>
        <td style="padding: 10px 0;">${new Date(params.geburtsdatum).toLocaleDateString('de-DE')}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b6b6b;">Telefon</td>
        <td style="padding: 10px 0;">${params.telefon}</td>
      </tr>
    </table>
    <p style="margin: 24px 0 8px;"><strong>Bitte entscheiden Sie:</strong></p>
    <div style="text-align: center; margin: 16px 0;">
      <a href="${params.freischaltLink}" style="${BUTTON_STYLE}">Freischalten</a>
      &nbsp;&nbsp;&nbsp;
      <a href="${params.ablehnungLink}" style="${BUTTON_DANGER_STYLE}">Ablehnen</a>
    </div>
    <p style="font-size: 13px; color: #6b6b6b;">Alternativ können Sie die Registrierung auch im Admin-Dashboard bearbeiten.</p>
  `)
  return { subject, html }
}

export function emailFreischaltungBestaetigung(params: {
  vorname: string
  loginLink: string
}): { subject: string; html: string } {
  const subject = 'Ihr Patientenportal-Zugang ist freigeschaltet'
  const html = layout(subject, `
    <h2 style="color: #4e6b53; font-size: 18px; margin: 0 0 16px;">Herzlich willkommen, ${params.vorname}!</h2>
    <p>Ihr Zugang zum Patientenportal der Naturheilpraxis Hilfreich wurde freigeschaltet.</p>
    <p>Ab sofort können Sie:</p>
    <ul style="color: #2d2d2d; line-height: 2;">
      <li>Ihre Rechnungen einsehen und herunterladen</li>
      <li>Behandlungsdokumente abrufen</li>
      <li>Anamnesebögen ausfüllen und hochladen</li>
    </ul>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${params.loginLink}" style="${BUTTON_STYLE}">Zum Patientenportal</a>
    </div>
    <p style="font-size: 13px; color: #6b6b6b;">Falls Sie Fragen haben, erreichen Sie uns telefonisch oder per E-Mail.</p>
  `)
  return { subject, html }
}

export function emailAblehnung(params: {
  vorname: string
  nachname: string
  praxisEmail: string
  praxisTelefon: string
}): { subject: string; html: string } {
  const subject = 'Ihre Registrierungsanfrage – Naturheilpraxis Hilfreich'
  const html = layout(subject, `
    <h2 style="color: #4e6b53; font-size: 18px; margin: 0 0 16px;">Sehr geehrte/r ${params.vorname} ${params.nachname},</h2>
    <p>vielen Dank für Ihr Interesse am Patientenportal der Naturheilpraxis Hilfreich.</p>
    <p>Ihre Registrierungsanfrage konnte leider nicht bestätigt werden. Dies kann unterschiedliche Gründe haben, beispielsweise weil Sie noch kein aktives Behandlungsverhältnis mit unserer Praxis haben.</p>
    <p>Falls Sie Fragen haben oder einen Termin vereinbaren möchten, erreichen Sie uns unter:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr style="border-bottom: 1px solid #ddd5c8;">
        <td style="padding: 10px 0; color: #6b6b6b; width: 40%;">E-Mail</td>
        <td style="padding: 10px 0;"><a href="mailto:${params.praxisEmail}" style="color: #6b8f71;">${params.praxisEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b6b6b;">Telefon</td>
        <td style="padding: 10px 0;">${params.praxisTelefon}</td>
      </tr>
    </table>
    <p>Wir freuen uns, Ihnen persönlich weiterhelfen zu können.</p>
    <p style="margin-top: 24px;">Mit freundlichen Grüßen<br>Ihr Team der Naturheilpraxis Hilfreich</p>
  `)
  return { subject, html }
}

export function emailDokumentBereitgestellt(params: {
  vorname: string
  dateiname: string
  kategorie: string
  portalLink: string
}): { subject: string; html: string } {
  const subject = `Neues Dokument im Patientenportal: ${params.dateiname}`
  const html = layout(subject, `
    <h2 style="color: #4e6b53; font-size: 18px; margin: 0 0 16px;">Neues Dokument für Sie bereitgestellt</h2>
    <p>Sehr geehrte/r ${params.vorname},</p>
    <p>in Ihrem Patientenportal wurde ein neues Dokument für Sie abgelegt:</p>
    <div style="background: #eaf2eb; border: 1px solid #c8d8ca; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
      <p style="margin: 0 0 6px; font-weight: bold; color: #2d2d2d;">${params.dateiname}</p>
      <p style="margin: 0; font-size: 13px; color: #4e6b53;">Kategorie: ${params.kategorie}</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${params.portalLink}" style="${BUTTON_STYLE}">Dokument abrufen</a>
    </div>
    <p style="font-size: 13px; color: #6b6b6b;">Bitte melden Sie sich mit Ihren Zugangsdaten im Portal an, um das Dokument herunterzuladen.</p>
  `)
  return { subject, html }
}

export function emailDokumentHochgeladen(params: {
  patientVorname: string
  patientNachname: string
  dateiname: string
  kategorie: string
  adminLink: string
}): { subject: string; html: string } {
  const subject = `Dokument hochgeladen: ${params.patientVorname} ${params.patientNachname}`
  const html = layout(subject, `
    <h2 style="color: #4e6b53; font-size: 18px; margin: 0 0 16px;">Neues Dokument von Patient</h2>
    <p><strong>${params.patientVorname} ${params.patientNachname}</strong> hat ein Dokument im Patientenportal hochgeladen:</p>
    <div style="background: #f0ebe0; border: 1px solid #ddd5c8; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
      <p style="margin: 0 0 6px; font-weight: bold; color: #2d2d2d;">${params.dateiname}</p>
      <p style="margin: 0; font-size: 13px; color: #6b6b6b;">Kategorie: ${params.kategorie}</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${params.adminLink}" style="${BUTTON_STYLE}">Im Admin-Dashboard ansehen</a>
    </div>
  `)
  return { subject, html }
}
