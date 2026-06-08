import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import StoresPageClient from './StoresPageClient'
import type { VendorWithPlan } from '@/types'
import { VENDOR_CATEGORIES } from '@/types'

export const revalidate = 60

interface SearchParams {
  q?: string
  category?: string
  city?: string
  filter?: string
}

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('vendors')
    .select('*, vendor_plans(plan), vendor_reviews(rating)')
    .eq('is_active', true)
    .eq('status', 'active')

  if (params.q) {
    query = query.ilike('store_name', `%${params.q}%`)
  }

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  if (params.city && params.city !== 'all') {
    query = query.eq('city', params.city)
  }

  if (params.filter === 'offers') {
    const now = new Date().toISOString()
    const { data: flashVendors } = await supabase
      .from('flash_sales')
      .select('vendor_id')
      .eq('is_active', true)
      .gt('ends_at', now)
    const ids = (flashVendors ?? []).map((f) => (f as any).vendor_id as string)
    // if no active flash sales exist, match nothing
    query = ids.length > 0 ? query.in('id', ids) : query.eq('id', '00000000-0000-0000-0000-000000000000')
  }

  if (params.filter === 'new') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    query = query.gte('created_at', cutoff.toISOString())
  }

  const { data: vendors } = await query.order('created_at', { ascending: false })

  const vendorList = (vendors ?? []) as unknown as VendorWithPlan[]

  // Get distinct cities
  const cities = Array.from(new Set(vendorList.map((v) => v.city).filter(Boolean))) as string[]

  // Fetch up to 4 active products per vendor for the preview strip
  const vendorIds = vendorList.map((v) => v.id)
  let productsByVendor: Record<string, { id: string; name: string; images: string[]; price: number; slug: string }[]> = {}

  if (vendorIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, images, price, slug, vendor_id')
      .in('vendor_id', vendorIds)
      .eq('is_active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    for (const p of products ?? []) {
      if (!productsByVendor[p.vendor_id]) productsByVendor[p.vendor_id] = []
      if (productsByVendor[p.vendor_id].length < 10) productsByVendor[p.vendor_id].push(p)
    }
  }

  return (
    <SiteLayout>
      <StoresPageClient
        vendors={vendorList}
        cities={cities}
        categories={[...VENDOR_CATEGORIES]}
        productsByVendor={productsByVendor}
        initialFilters={{
          q: params.q,
          category: params.category,
          city: params.city,
          filter: params.filter,
        }}
      />
    </SiteLayout>
  )
}
