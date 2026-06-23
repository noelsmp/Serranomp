import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Patientenportal – Naturheilpraxis Hilfreich',
  description: 'Ihr sicherer Zugang zu Dokumenten, Rechnungen und Informationen der Naturheilpraxis Hilfreich in Moers.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
