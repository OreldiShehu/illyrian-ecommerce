'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type TrackingResult = {
  id: string
  status: string
  created_at: string
  total: number
  shipping_name: string
  shipping_city: string
  order_items: Array<{
    id: string
    quantity: number
    price: number
    size: string | null
    color: string | null
    products: { name: string; images: string[] } | null
  }>
}

const NORMALIZE = (p: string) => p.replace(/\D/g, '')

export async function lookupOrder(
  orderNumber: string,
  phone: string,
): Promise<{ success: true; data: TrackingResult } | { success: false; error: string }> {
  const raw = orderNumber.trim().toUpperCase().replace(/^AL-?/, '')
  if (raw.length < 4) return { success: false, error: 'invalid_number' }

  const admin = createAdminClient()

  const { data: orders } = await admin
    .from('orders')
    .select('id, status, created_at, total, shipping_name, shipping_city, shipping_phone, order_items(id, quantity, price, size, color, products(name, images))')
    .ilike('id', `${raw.toLowerCase()}%`)
    .limit(5)

  if (!orders || orders.length === 0) return { success: false, error: 'not_found' }

  const normalizedInput = NORMALIZE(phone.trim())
  const match = orders.find((o) => NORMALIZE(o.shipping_phone ?? '') === normalizedInput)

  if (!match) return { success: false, error: 'phone_mismatch' }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { shipping_phone: _omit, ...safe } = match
  return { success: true, data: safe as unknown as TrackingResult }
}
