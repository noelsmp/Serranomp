import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? 'portal@naturheilpraxis-hilfreich.de'

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })

  if (error) {
    console.error('E-Mail Fehler:', error)
    throw new Error(`E-Mail konnte nicht gesendet werden: ${error.message}`)
  }
}
