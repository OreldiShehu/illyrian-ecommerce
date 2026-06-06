'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function toggleWishlist(productId: string): Promise<ActionResult<{ added: boolean }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Duhet të jeni të kyçur.' }

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
    revalidatePath('/account')
    return { success: true, data: { added: false } }
  }

  await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId })
  revalidatePath('/account')
  return { success: true, data: { added: true } }
}

export async function removeFromWishlist(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Duhet të jeni të kyçur.' }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/account')
  return { success: true }
}
