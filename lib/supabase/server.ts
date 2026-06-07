import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  const clean = (s: string) => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s

  return createServerClient<Database>(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — ignored
          }
        },
      },
    }
  )
}
