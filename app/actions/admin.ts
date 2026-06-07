'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCommissionReminder } from '@/lib/resend'
import type { ActionResult } from '@/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nuk jeni të kyçur.')
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  if ((data as { role: string } | null)?.role !== 'admin') throw new Error('Nuk keni akses admin.')
  return user
}

export async function approveVendor(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const vendorId = formData.get('vendor_id') as string
    const admin = createAdminClient()

    const { error } = await admin.from('vendors').update({ status: 'active', is_active: true }).eq('id', vendorId)
    if (error) return { success: false, error: error.message }

    const { data: vendor } = await admin.from('vendors').select('user_id, store_name').eq('id', vendorId).single()
    if (vendor) {
      await admin.from('notifications').insert({
        user_id: vendor.user_id,
        type: 'vendor_approved',
        message: `Dyqani juaj "${vendor.store_name}" u aprovua! Tani mund të shtoni produkte.`,
      })
    }

    revalidatePath('/admin/vendors')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function rejectVendor(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const vendorId = formData.get('vendor_id') as string
    const reason = (formData.get('reason') as string) || 'Aplikimi nuk plotëson kriteret.'
    const admin = createAdminClient()

    const { error } = await admin.from('vendors').update({ status: 'rejected', is_active: false }).eq('id', vendorId)
    if (error) return { success: false, error: error.message }

    const { data: vendor } = await admin.from('vendors').select('user_id, store_name').eq('id', vendorId).single()
    if (vendor) {
      await admin.from('notifications').insert({
        user_id: vendor.user_id,
        type: 'vendor_rejected',
        message: `Aplikimi për dyqanin "${vendor.store_name}" u refuzua. ${reason}`,
      })
    }

    revalidatePath('/admin/vendors')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function toggleVendorActive(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const vendorId = formData.get('vendor_id') as string
    const isActive = formData.get('is_active') === 'true'
    const admin = createAdminClient()
    const { error } = await admin.from('vendors').update({ is_active: isActive }).eq('id', vendorId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/vendors')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateCommissionRate(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const vendorId = formData.get('vendor_id') as string
    const rate = parseFloat(formData.get('commission_rate') as string)
    if (isNaN(rate) || rate < 0 || rate > 100) return { success: false, error: 'Norma duhet të jetë 0–100.' }
    const admin = createAdminClient()
    const { error } = await admin.from('vendors').update({ commission_rate: rate }).eq('id', vendorId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/vendors')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function markCommissionReceived(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const ledgerId = formData.get('ledger_id') as string
    const admin = createAdminClient()

    const { data: ledger, error } = await admin
      .from('commission_ledger')
      .update({ status: 'received', paid_at: new Date().toISOString() })
      .eq('id', ledgerId)
      .select('vendor_id, amount_owed')
      .single()

    if (error || !ledger) return { success: false, error: 'Operacioni dështoi.' }

    const { data: vendor } = await admin.from('vendors').select('user_id').eq('id', ledger.vendor_id).single()
    if (vendor) {
      await admin.from('notifications').insert({
        user_id: vendor.user_id,
        type: 'commission_received',
        message: `Komisioni juaj prej €${ledger.amount_owed.toFixed(2)} u konfirmua nga admini.`,
      })
    }

    revalidatePath('/admin/commissions')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function sendCommissionReminderEmail(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const vendorId = formData.get('vendor_id') as string
    const amount = parseFloat(formData.get('amount') as string) || 0
    const admin = createAdminClient()

    const { data: vendor } = await admin.from('vendors').select('user_id, store_name').eq('id', vendorId).single()
    if (!vendor) return { success: false, error: 'Dyqani nuk u gjet.' }

    const { data: vendorUser } = await admin.from('users').select('email').eq('id', vendor.user_id).single()
    if (!vendorUser) return { success: false, error: 'Email-i nuk u gjet.' }

    const { data: ledger } = await admin
      .from('commission_ledger')
      .select('due_date')
      .eq('vendor_id', vendorId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(1)

    const dueDate = ledger?.[0]?.due_date ?? new Date().toISOString()

    await sendCommissionReminder(vendorUser.email, {
      storeName: vendor.store_name,
      amountOwed: amount,
      dueDate,
    })

    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function createCoupon(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    const code = (formData.get('code') as string).toUpperCase().trim()
    const discountType = formData.get('discount_type') as 'fixed' | 'percentage'
    const discountValue = parseFloat(formData.get('discount_value') as string)
    const minOrder = formData.get('min_order') ? parseFloat(formData.get('min_order') as string) : null
    const maxUses = formData.get('max_uses') ? parseInt(formData.get('max_uses') as string) : null
    const expiresAt = formData.get('expires_at') as string | null

    if (!code || !discountType || isNaN(discountValue)) {
      return { success: false, error: 'Kodi dhe vlera e zbritjes janë të detyrueshme.' }
    }

    const { error } = await admin.from('coupons').insert({
      code,
      discount_type: discountType,
      discount_value: discountValue,
      min_order: minOrder,
      uses_limit: maxUses,
      expires_at: expiresAt || null,
    })

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Ky kod ekziston tashmë.' }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function toggleCoupon(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const couponId = formData.get('coupon_id') as string
    const isActive = formData.get('is_active') === 'true'
    const admin = createAdminClient()
    const { error } = await admin.from('coupons').update({ is_active: isActive }).eq('id', couponId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteCoupon(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const couponId = formData.get('coupon_id') as string
    const admin = createAdminClient()
    const { error } = await admin.from('coupons').delete().eq('id', couponId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function assignFeaturedSlot(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    const slotPosition = parseInt(formData.get('slot_position') as string)
    const productId = formData.get('product_id') as string
    const endsAt = formData.get('ends_at') as string | null

    if (!productId || isNaN(slotPosition)) return { success: false, error: 'Produkti dhe sloti janë të detyrueshme.' }

    const { data: product } = await admin.from('products').select('vendor_id').eq('id', productId).single()

    // Deactivate any existing slot at this position
    await admin.from('featured_slots').update({ is_active: false }).eq('slot_position', slotPosition).eq('is_active', true)

    const startsAt = new Date().toISOString()

    const { error } = await admin.from('featured_slots').insert({
      slot_position: slotPosition,
      product_id: productId,
      vendor_id: product?.vendor_id ?? null,
      starts_at: startsAt,
      ends_at: endsAt || null,
      is_active: true,
    })

    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/featured')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function removeFeaturedSlot(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const slotId = formData.get('slot_id') as string
    const admin = createAdminClient()
    const { error } = await admin.from('featured_slots').update({ is_active: false }).eq('id', slotId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/featured')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
