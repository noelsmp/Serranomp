import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_NAME = 'portal_session'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hasSession = request.cookies.has(COOKIE_NAME)

  // Geschützte Patient-Routen
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/dokumente') ||
    pathname.startsWith('/rechnungen') ||
    pathname.startsWith('/dsgvo')
  ) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Admin-Routen (vollständige Prüfung im Layout)
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
