import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const clean = (s: string) => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s

export function createAdminClient() {
  return createClient<Database>(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
