import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Public client — safe for use in client components (anon key only).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Service-role client — server-side only. Never import in client components.
 * Has full DB access, bypasses RLS.
 *
 * The global fetch override sets cache: 'no-store' on every request so that
 * Next.js 14's Data Cache never serves stale Supabase query results. Without
 * this, the default fetch cache means new rows are invisible until the cache
 * is manually revalidated.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  global: {
    fetch: (url: RequestInfo | URL, options?: RequestInit) =>
      fetch(url, { ...options, cache: 'no-store' }),
  },
})
