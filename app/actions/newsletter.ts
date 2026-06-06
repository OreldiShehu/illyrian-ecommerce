'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendNewsletterWelcome } from '@/lib/resend'
import type { ActionResult } from '@/types'

export async function subscribeNewsletter(email: string): Promise<ActionResult> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Email i pavlefshëm.' }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('email_subscribers')
    .insert({ email })

  if (error) {
    if (error.code === '23505') {
      return { success: true } // Already subscribed — not an error
    }
    return { success: false, error: 'Gabim. Provoni përsëri.' }
  }

  try {
    await sendNewsletterWelcome(email)
  } catch {
    // Email failure is non-fatal
  }

  return { success: true }
}
