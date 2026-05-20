import { NextRequest, NextResponse } from 'next/server'

export const PREVIEW_COOKIE = 'flex_preview_access'

const HMAC_MESSAGE = 'flex-preview-v1'

/**
 * HMAC-SHA256 using the Web Crypto API.
 * Available in both Edge Runtime (Vercel middleware) and Node.js 18+.
 * Produces the same bytes as Node's createHmac('sha256', key).update(msg).digest('hex').
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
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(HMAC_MESSAGE))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function redirectToGate(request: NextRequest): NextResponse {
  const destination = request.nextUrl.pathname + request.nextUrl.search
  const gateUrl = request.nextUrl.clone()
  gateUrl.pathname = '/preview/access'
  gateUrl.search = `?from=${encodeURIComponent(destination)}`
  return NextResponse.redirect(gateUrl)
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const password = process.env.FLEX_PREVIEW_PASSWORD

  // Fail CLOSED: if the env var is missing or empty, block access.
  // This prevents a misconfigured deployment from exposing candidate data.
  if (!password) {
    return redirectToGate(request)
  }

  try {
    const token = request.cookies.get(PREVIEW_COOKIE)?.value
    if (token && token === (await expectedToken(password))) {
      return NextResponse.next()
    }
  } catch {
    // If token verification fails for any reason, fail closed.
  }

  return redirectToGate(request)
}

export const config = {
  // Single regex — matches /preview/candidates and every path beneath it.
  // Using (.*) avoids ambiguity with Next.js :param* zero-segment edge cases.
  matcher: ['/preview/candidates(.*)'],
}
