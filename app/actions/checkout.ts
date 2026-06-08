'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendOrderConfirmation,
  sendNewOrderAlert,
} from '@/lib/resend'
import { sendWhatsAppToVendor } from '@/lib/twilio'
import { calculateLoyaltyPoints, getDeliveryFee } from '@/lib/utils'
import type { ActionResult, CartItem } from '@/types'

interface CheckoutData {
  name: string
  phone: string
  address: string
  city: string
  notes?: string
  couponCode?: string
  loyaltyPointsUsed?: number
  items: CartItem[]
}

export async function placeOrder(data: CheckoutData): Promise<ActionResult<{ orderId: string }>> {
  let createdOrderId: string | null = null
  try {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  const customerId = user?.id ?? null
  const loyaltyPointsUsed = user ? data.loyaltyPointsUsed ?? 0 : 0
  const loyaltyDiscount = loyaltyPointsUsed * 0.01

  if (!data.name || !data.phone || !data.address || !data.city) {
    return { success: false, error: 'Të gjitha fushat janë të detyrueshme.' }
  }

  if (!data.items.length) {
    return { success: false, error: 'Shporta juaj është bosh.' }
  }

  // Validate stock for each item
  for (const item of data.items) {
    const { data: product } = await admin
      .from('products')
      .select('stock, price, name')
      .eq('id', item.productId)
      .single()

    if (!product) return { success: false, error: `Produkti "${item.name}" nuk u gjet.` }
    if (product.stock < item.quantity) {
      return { success: false, error: `"${item.name}" nuk ka stok të mjaftueshëm.` }
    }
  }

  // Validate and apply coupon
  let couponDiscount = 0
  let couponId: string | null = null

  if (data.couponCode) {
    const { data: coupon } = await admin
      .from('coupons')
      .select('*')
      .eq('code', data.couponCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (coupon) {
      const now = new Date()
      const expired = coupon.expires_at && new Date(coupon.expires_at) < now
      const limitReached = coupon.uses_limit !== null && coupon.uses_count >= coupon.uses_limit
      const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0)

      if (!expired && !limitReached && subtotal >= coupon.min_order) {
        couponId = coupon.id
        couponDiscount = coupon.discount_type === 'fixed'
          ? Math.min(coupon.discount_value, subtotal)
          : (subtotal * coupon.discount_value) / 100
      }
    }
  }

  // Calculate totals
  const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = getDeliveryFee(subtotal - couponDiscount)
  const total = Math.max(0, subtotal - couponDiscount - loyaltyDiscount + deliveryFee)

  // Create order
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      customer_id: customerId,
      status: 'pending',
      total,
      shipping_name: data.name,
      shipping_phone: data.phone,
      shipping_address: data.address,
      shipping_city: data.city,
      shipping_notes: data.notes || null,
      payment_method: 'cash_on_delivery',
      coupon_code: data.couponCode || null,
      coupon_discount: couponDiscount,
      loyalty_points_used: loyaltyPointsUsed,
      loyalty_discount: loyaltyDiscount,
      delivery_fee: deliveryFee,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Porosia dështoi. Provoni përsëri.' }
  }

  // Group items by vendor for notifications
  const vendorMap = new Map<string, { email: string; userId: string; storeName: string; whatsapp: string | null; items: typeof data.items }>()

  // Create order items, deduct stock, build vendor map
  for (const item of data.items) {
    const { data: product } = await admin
      .from('products')
      .select('vendor_id, price')
      .eq('id', item.productId)
      .single()

    if (!product) continue

    const { data: vendorRow } = await admin
      .from('vendors')
      .select('id, store_name, commission_rate, user_id, whatsapp')
      .eq('id', product.vendor_id)
      .single()

    const { data: vendorUser } = vendorRow?.user_id
      ? await admin.from('users').select('email').eq('id', vendorRow.user_id).single()
      : { data: null }

    const commissionDue = item.price * item.quantity * ((vendorRow?.commission_rate ?? 12) / 100)

    await admin.from('order_items').insert({
      order_id: order.id,
      product_id: item.productId,
      vendor_id: product.vendor_id,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      price: item.price,
      vendor_commission_due: commissionDue,
    })

    // Deduct stock
    const { error: rpcStockErr } = await admin.rpc('decrement_stock', { product_id: item.productId, amount: item.quantity })
    if (rpcStockErr) {
      await admin.from('products')
        .update({ stock: Math.max(0, (item.stock ?? 0) - item.quantity) })
        .eq('id', item.productId)
    }

    if (vendorRow && vendorUser) {
      if (!vendorMap.has(product.vendor_id)) {
        vendorMap.set(product.vendor_id, {
          email: vendorUser.email,
          userId: vendorRow.user_id,
          storeName: vendorRow.store_name,
          whatsapp: vendorRow.whatsapp ?? null,
          items: [],
        })
      }
      vendorMap.get(product.vendor_id)!.items.push(item)
    }
  }

  // Increment coupon usage
  if (couponId) {
    const { error: rpcCouponErr } = await admin.rpc('increment_coupon_uses', { coupon_id: couponId })
    if (rpcCouponErr) {
      const { data: c } = await admin.from('coupons').select('uses_count').eq('id', couponId!).single()
      await admin.from('coupons').update({ uses_count: (c?.uses_count ?? 0) + 1 }).eq('id', couponId!)
    }
  }

  // Award loyalty points (1 per €1) for logged-in customers only
  if (user) {
    const pointsEarned = calculateLoyaltyPoints(total)
    if (pointsEarned > 0) {
      await admin.from('loyalty_points').insert({
        user_id: user.id,
        points: pointsEarned,
        reason: `Porosi #${order.id.slice(0, 8).toUpperCase()}`,
        order_id: order.id,
      })
    }
  }

  // Deduct loyalty points if used and customer is logged in
  if (user && loyaltyPointsUsed > 0) {
    await admin.from('loyalty_points').insert({
      user_id: user.id,
      points: -loyaltyPointsUsed,
      reason: 'Zbritje nga pikët e besnikërisë',
      order_id: order.id,
    })
  }

  // Create customer notification for logged-in users only
  if (user) {
    await admin.from('notifications').insert({
      user_id: user.id,
      type: 'order_placed',
      message: `Porosia juaj #${order.id.slice(0, 8).toUpperCase()} u vendos me sukses.`,
    })
  }

  // Send emails if we have a logged-in customer email
  if (user) {
    const { data: customerData } = await admin.from('users').select('email, name').eq('id', user.id).single()

    if (customerData) {
      try {
        await sendOrderConfirmation(customerData.email, {
          customerName: customerData.name,
          orderId: order.id,
          items: data.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, size: i.size, color: i.color })),
          total,
          deliveryFee,
          shippingAddress: data.address,
          shippingCity: data.city,
        })
      } catch { /* non-fatal */ }
    }
  }

  for (const [, vendor] of vendorMap) {
    const itemSummary = vendor.items.map((i) => `${i.name} x${i.quantity}`).join(', ')
    // In-app notification for vendor
    await admin.from('notifications').insert({
      user_id: vendor.userId,
      type: 'new_order',
      message: `Porosi e re #${order.id.slice(0, 8).toUpperCase()} nga ${data.city} — ${itemSummary}.`,
    })
    // Email notification for vendor
    try {
      await sendNewOrderAlert(vendor.email, {
        orderId: order.id,
        storeName: vendor.storeName,
        items: vendor.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        customerCity: data.city,
        total,
      })
    } catch { /* non-fatal */ }
    // WhatsApp notification for vendor
    if (vendor.whatsapp) {
      try {
        await sendWhatsAppToVendor({
          to: vendor.whatsapp,
          storeName: vendor.storeName,
          orderId: order.id,
          items: vendor.items.map((i) => ({ name: i.name, quantity: i.quantity })),
          city: data.city,
          total,
        })
      } catch { /* non-fatal */ }
    }
  }

  createdOrderId = order.id
  } catch (e: unknown) {
    console.error('[placeOrder] unexpected error:', e)
    return { success: false, error: String(e instanceof Error ? e.message : e) }
  }

  // redirect() must be called outside try/catch — it throws NEXT_REDIRECT internally
  redirect(`/order-confirmed/${createdOrderId}`)
}

export async function validateCoupon(code: string, subtotal: number): Promise<ActionResult<{ discount: number; coupon: { code: string; discount_type: string; discount_value: number; min_order: number } }>> {
  const admin = createAdminClient()

  const { data: coupon } = await admin
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!coupon) return { success: false, error: 'Kodi i zbritjes nuk u gjet ose nuk është aktiv.' }

  const now = new Date()
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { success: false, error: 'Kodi i zbritjes ka skaduar.' }
  }

  if (coupon.uses_limit !== null && coupon.uses_count >= coupon.uses_limit) {
    return { success: false, error: 'Kodi i zbritjes ka arritur limitin e përdorimit.' }
  }

  if (subtotal < coupon.min_order) {
    return { success: false, error: `Porosia minimale për këtë kod është €${coupon.min_order.toFixed(2)}.` }
  }

  const discount = coupon.discount_type === 'fixed'
    ? Math.min(coupon.discount_value, subtotal)
    : (subtotal * coupon.discount_value) / 100

  return { success: true, data: { discount, coupon } }
}
