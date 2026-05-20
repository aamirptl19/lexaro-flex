import { NextRequest, NextResponse } from 'next/server'

export const PREVIEW_COOKIE = 'flex_preview_access'

const MESSAGE = 'flex-preview-v1'

/**
 * Compute the expected cookie token using the Web Crypto API (HMAC-SHA256).
 * Web Crypto is available in both the Edge Runtime (middleware) and Node.js
 * 18+, so this works here. The server action uses Node's createHmac, which
 * produces identical output for the same key + message.
 */
async function expectedToken(password: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(MESSAGE))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function middleware(request: NextRequest) {
  const password = process.env.FLEX_PREVIEW_PASSWORD

  // No password configured → allow through (local dev fallback)
  if (!password) return NextResponse.next()

  const token = request.cookies.get(PREVIEW_COOKIE)?.value
  if (token && token === (await expectedToken(password))) return NextResponse.next()

  // Not authenticated — redirect to the gate, preserving the destination
  const destination = request.nextUrl.pathname + request.nextUrl.search
  const gateUrl = request.nextUrl.clone()
  gateUrl.pathname = '/preview/access'
  gateUrl.search = `?from=${encodeURIComponent(destination)}`
  return NextResponse.redirect(gateUrl)
}

export const config = {
  // Protect all /preview/candidates routes; leave /preview/access public
  matcher: ['/preview/candidates', '/preview/candidates/:path*'],
}
