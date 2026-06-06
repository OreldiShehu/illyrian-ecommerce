import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import HeroSection from '@/components/home/HeroSection'
import SearchSection from '@/components/home/SearchSection'
import OffersBanner from '@/components/home/OffersBanner'
import StoresSection from '@/components/home/StoresSection'
import BrandSection from '@/components/home/BrandSection'
import NewsletterSection from '@/components/home/NewsletterSection'
import type { VendorWithPlan, ProductWithVendor } from '@/types'

export const revalidate = 60

async function getData() {
  const supabase = await createClient()

  const [vendorsResult, productsResult, flashSaleResult] = await Promise.all([
    supabase
      .from('vendors')
      .select('*, vendor_plans(plan), vendor_reviews(rating)')
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6),

    supabase
      .from('products')
      .select('*, vendors(id, store_name, slug, logo_url, whatsapp, city, is_verified), flash_sales(discount_percent, starts_at, ends_at, is_active)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(20),

    supabase
      .from('flash_sales')
      .select('vendor_id')
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString()),
  ])

  return {
    vendors: (vendorsResult.data ?? []) as unknown as VendorWithPlan[],
    products: (productsResult.data ?? []) as unknown as ProductWithVendor[],
    activeFlashSaleCount: (flashSaleResult.data ?? []).length,
  }
}

export default async function HomePage() {
  const { vendors, activeFlashSaleCount } = await getData()

  return (
    <SiteLayout>
      <HeroSection />
      <SearchSection />
      <OffersBanner count={activeFlashSaleCount} />
      <StoresSection vendors={vendors} />
      <BrandSection />
      <NewsletterSection />
    </SiteLayout>
  )
}
