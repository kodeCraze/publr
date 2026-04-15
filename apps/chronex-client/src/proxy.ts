import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/config/authInstance'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await auth.api.getSession({ headers: request.headers })
  const user = session?.user ?? null
  const workspaceId = request.cookies.get('workspaceId')?.value ?? null

  if (pathname === '/workspace' || pathname.startsWith('/workspace/')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Allow landing on /home immediately after login; the client will initialize workspaceId.
  if (pathname === '/home' || pathname.startsWith('/home/')) {
    return NextResponse.next()
  }

  if (!workspaceId) return NextResponse.redirect(new URL('/workspace', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/home/:path*',
    '/workspace/:path*',
    '/post/:path*',
    '/tokens/:path*',
    '/media/:path*',
    '/profile/:path*',
  ],
}
