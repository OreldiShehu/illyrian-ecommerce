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

  const { data: vendors } = await query.order('created_at', { ascending: false })

  const vendorList = (vendors ?? []) as unknown as VendorWithPlan[]

  // Get distinct cities
  const cities = Array.from(new Set(vendorList.map((v) => v.city).filter(Boolean))) as string[]

  return (
    <SiteLayout>
      <StoresPageClient
        vendors={vendorList}
        cities={cities}
        categories={[...VENDOR_CATEGORIES]}
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
