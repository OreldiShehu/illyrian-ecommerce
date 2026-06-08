'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Strip BOM (U+FEFF) that may be prepended by env var storage
const clean = (s: string) => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s

export function createClient() {
  return createBrowserClient<Database>(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
  )
}
