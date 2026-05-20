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
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
