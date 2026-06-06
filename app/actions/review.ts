'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function submitReview(
  productId: string,
  slug: string,
  rating: number,
  comment: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Duhet të jeni të kyçur.' }

  if (rating < 1 || rating > 5) return { success: false, error: 'Vlerësimi duhet të jetë 1–5.' }

  // Verify delivered order containing this product
  const { data: eligibleOrder } = await supabase
    .from('orders')
    .select('id, order_items!inner(product_id)')
    .eq('customer_id', user.id)
    .eq('status', 'delivered')
    .eq('order_items.product_id', productId)
    .limit(1)
    .single()

  if (!eligibleOrder) {
    return { success: false, error: 'Mund të komentoni vetëm pas marrjes së produktit.' }
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    customer_id: user.id,
    rating,
    comment: comment.trim() || null,
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Keni komentuar tashmë për këtë produkt.' }
    return { success: false, error: error.message }
  }

  revalidatePath(`/products/${slug}`)
  return { success: true }
}
