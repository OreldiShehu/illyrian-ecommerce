'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderStatusUpdate } from '@/lib/resend'
import { slugify } from '@/lib/utils'
import { uploadImage } from '@/lib/cloudinary'
import type { ActionResult } from '@/types'

function parseList(raw: string | null): string[] {
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return []
  return raw.split('\n').map((s) => s.trim()).filter(Boolean)
}

export async function completeOnboarding(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const storeName = formData.get('store_name') as string
  const rawSlug = formData.get('slug') as string
  const city = formData.get('city') as string
  const category = formData.get('category') as string
  const bio = formData.get('bio') as string
  const logoUrl = formData.get('logo_url') as string | null
  const bannerUrl = formData.get('banner_url') as string | null
  const whatsapp = formData.get('whatsapp') as string
  const bankName = formData.get('bank_name') as string
  const iban = formData.get('iban') as string
  const accountHolder = formData.get('account_holder') as string
  const plan = (formData.get('plan') as string) || 'free'

  if (!storeName || !city || !category) {
    return { success: false, error: 'Emri, qyteti dhe kategoria janë të detyrueshme.' }
  }

  const slug = slugify(rawSlug || storeName)
  const admin = createAdminClient()

  const { data: existing } = await admin.from('vendors').select('id').eq('slug', slug).single()
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { data: vendor, error } = await admin.from('vendors').insert({
    user_id: user.id,
    store_name: storeName,
    slug: finalSlug,
    city,
    category,
    bio: bio || null,
    logo_url: logoUrl || null,
    banner_url: bannerUrl || null,
    whatsapp: whatsapp || null,
    bank_name: bankName || null,
    iban: iban || null,
    account_holder: accountHolder || null,
    status: 'pending',
    is_active: false,
  }).select('id').single()

  if (error || !vendor) {
    console.error('Vendor onboarding failed:', error?.message ?? error)
    return { success: false, error: error?.message ?? 'Regjistrimi dështoi. Provoni përsëri.' }
  }

  const { error: planError } = await admin.from('vendor_plans').insert({ vendor_id: vendor.id, plan: plan as 'free' | 'pro' })
  if (planError) {
    console.error('Vendor plan insert failed:', planError.message)
    return { success: false, error: planError.message }
  }

  revalidatePath('/vendor/onboarding')
  return { success: true }
}

export async function createProduct(formData: FormData): Promise<ActionResult<{ productId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const admin = createAdminClient()
  const { data: vendor } = await admin.from('vendors').select('id, status').eq('user_id', user.id).single()
  if (!vendor || vendor.status !== 'active') return { success: false, error: 'Dyqani juaj nuk është aprovuar.' }

  const { data: planData } = await admin.from('vendor_plans').select('plan').eq('vendor_id', vendor.id).single()
  if (planData?.plan === 'free') {
    const { count } = await admin.from('products').select('id', { count: 'exact', head: true }).eq('vendor_id', vendor.id)
    if ((count ?? 0) >= 20) {
      return { success: false, error: 'Plani falas lejon deri në 20 produkte. Kaloni në Pro për më shumë.' }
    }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const comparePrice = formData.get('compare_price') ? parseFloat(formData.get('compare_price') as string) : null
  const category = formData.get('category') as string
  const sizes = parseList(formData.get('sizes') as string)
  const colors = parseList(formData.get('colors') as string)
  const stock = parseInt(formData.get('stock') as string) || 0
  const images = parseImageUrls(formData.get('images') as string)
  const isActive = formData.get('is_active') === 'true'
  const rawSlug = formData.get('slug') as string

  if (!name || isNaN(price)) return { success: false, error: 'Emri dhe çmimi janë të detyrueshme.' }

  const slug = rawSlug || slugify(name)
  const { data: existing } = await admin.from('products').select('id').eq('slug', slug).single()
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { data: product, error } = await admin.from('products').insert({
    vendor_id: vendor.id,
    name,
    slug: finalSlug,
    description: description || null,
    price,
    compare_price: comparePrice,
    category,
    sizes,
    colors,
    stock,
    images,
    is_active: isActive,
  }).select('id').single()

  if (error || !product) return { success: false, error: 'Krijimi i produktit dështoi.' }

  revalidatePath('/vendor/products')
  return { success: true, data: { productId: product.id } }
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const productId = formData.get('product_id') as string
  if (!productId) return { success: false, error: 'ID e produktit mungon.' }

  const admin = createAdminClient()
  const { data: vendor } = await admin.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return { success: false, error: 'Dyqani nuk u gjet.' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const comparePrice = formData.get('compare_price') ? parseFloat(formData.get('compare_price') as string) : null
  const category = formData.get('category') as string
  const sizes = parseList(formData.get('sizes') as string)
  const colors = parseList(formData.get('colors') as string)
  const stock = parseInt(formData.get('stock') as string) || 0
  const images = parseImageUrls(formData.get('images') as string)
  const isActive = formData.get('is_active') === 'true'

  const { error } = await admin.from('products').update({
    name,
    description: description || null,
    price,
    compare_price: comparePrice,
    category,
    sizes,
    colors,
    stock,
    images,
    is_active: isActive,
  }).eq('id', productId).eq('vendor_id', vendor.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/vendor/products')
  return { success: true }
}

export async function deleteProduct(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const productId = formData.get('product_id') as string
  if (!productId) return { success: false, error: 'ID e produktit mungon.' }

  const admin = createAdminClient()
  const { data: vendor } = await admin.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return { success: false, error: 'Dyqani nuk u gjet.' }

  const { error } = await admin.from('products').delete().eq('id', productId).eq('vendor_id', vendor.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/vendor/products')
  return { success: true }
}

export async function uploadProductImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { success: false, error: 'Nuk ka skedar.' }
  if (!file.type.startsWith('image/')) return { success: false, error: 'Skedari duhet të jetë imazh.' }

  try {
    const result = await uploadImage(file, 'products', 'product')
    return { success: true, data: { url: result.secure_url } }
  } catch (e) {
    const msg = e instanceof Error
      ? e.message
      : typeof e === 'object' && e !== null
        ? JSON.stringify(e)
        : String(e)
    console.error('[uploadProductImage]', msg)
    return { success: false, error: msg }
  }
}

export async function updateOrderStatus(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const orderId = formData.get('order_id') as string
  const newStatus = formData.get('status') as 'confirmed' | 'shipped' | 'delivered'

  if (!orderId || !newStatus) return { success: false, error: 'Parametrat mungojnë.' }

  const admin = createAdminClient()
  const { data: vendor } = await admin.from('vendors').select('id, store_name').eq('user_id', user.id).single()
  if (!vendor) return { success: false, error: 'Dyqani nuk u gjet.' }

  const { error } = await admin.from('orders').update({ status: newStatus }).eq('id', orderId).eq('vendor_id', vendor.id)
  if (error) return { success: false, error: error.message }

  const { data: order } = await admin.from('orders').select('customer_id, shipping_name').eq('id', orderId).single()
  if (order?.customer_id) {
    const { data: customer } = await admin.from('users').select('email, name').eq('id', order.customer_id).single()
    if (customer && (newStatus === 'confirmed' || newStatus === 'shipped')) {
      try {
        await sendOrderStatusUpdate(customer.email, {
          customerName: customer.name,
          orderId,
          status: newStatus,
          vendorName: vendor.store_name,
        })
      } catch { /* non-fatal */ }
    }
    await admin.from('notifications').insert({
      user_id: order.customer_id,
      type: `order_${newStatus}`,
      message: `Porosia juaj është ${newStatus === 'confirmed' ? 'konfirmuar' : newStatus === 'shipped' ? 'dërguar' : 'dorëzuar'}.`,
    })
  }

  revalidatePath('/vendor/orders')
  return { success: true }
}

export async function markCODCollected(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const orderId = formData.get('order_id') as string
  if (!orderId) return { success: false, error: 'ID e porosisë mungon.' }

  const admin = createAdminClient()
  const { data: vendor } = await admin.from('vendors').select('id, commission_rate').eq('user_id', user.id).single()
  if (!vendor) return { success: false, error: 'Dyqani nuk u gjet.' }

  await admin.from('orders').update({ status: 'delivered' }).eq('id', orderId).eq('vendor_id', vendor.id)

  const { data: order } = await admin.from('orders').select('total').eq('id', orderId).single()
  if (order) {
    const commissionRate = vendor.commission_rate ?? 12
    const commissionAmount = order.total * (commissionRate / 100)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    await admin.from('commission_ledger').insert({
      vendor_id: vendor.id,
      order_id: orderId,
      amount_owed: commissionAmount,
      status: 'pending',
      due_date: dueDate.toISOString(),
    })
  }

  revalidatePath('/vendor/orders')
  revalidatePath('/vendor/commissions')
  return { success: true }
}

export async function createFlashSale(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const productId = formData.get('product_id') as string
  const discountPercentage = parseFloat(formData.get('discount_percentage') as string)
  const durationHours = parseFloat(formData.get('duration_hours') as string)

  if (!productId) return { success: false, error: 'ID e produktit mungon.' }
  if (isNaN(discountPercentage) || discountPercentage < 15) return { success: false, error: 'Zbritja minimale është 15%.' }
  if (isNaN(durationHours) || durationHours > 4 || durationHours < 1) return { success: false, error: 'Kohëzgjatja duhet të jetë 1–4 orë.' }

  const admin = createAdminClient()
  const { data: vendor } = await admin.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return { success: false, error: 'Dyqani nuk u gjet.' }

  const { data: planData } = await admin.from('vendor_plans').select('plan').eq('vendor_id', vendor.id).single()
  if (planData?.plan !== 'pro') return { success: false, error: 'Flash sale është disponibël vetëm për planin Pro.' }

  const startsAt = new Date()
  const endsAt = new Date(startsAt.getTime() + durationHours * 3600000)

  const { error } = await admin.from('flash_sales').insert({
    vendor_id: vendor.id,
    product_id: productId,
    discount_percent: discountPercentage,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    is_active: true,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/vendor/products')
  revalidatePath('/')
  return { success: true }
}

export async function markCommissionPaid(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nuk jeni të kyçur.' }

  const ledgerId = formData.get('ledger_id') as string
  if (!ledgerId) return { success: false, error: 'ID e komisionit mungon.' }

  const admin = createAdminClient()
  const { data: vendor } = await admin.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return { success: false, error: 'Dyqani nuk u gjet.' }

  const { error } = await admin
    .from('commission_ledger')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', ledgerId)
    .eq('vendor_id', vendor.id)

  if (error) return { success: false, error: error.message }

  const { data: adminUser } = await admin.from('users').select('id').eq('role', 'admin').limit(1).single()
  if (adminUser) {
    await admin.from('notifications').insert({
      user_id: adminUser.id,
      type: 'commission_payment_claimed',
      message: `Shitësi ka shënuar komisionin si të paguar. Ledger ID: ${ledgerId}`,
    })
  }

  revalidatePath('/vendor/commissions')
  return { success: true }
}
