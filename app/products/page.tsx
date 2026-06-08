import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import { PRODUCT_CATEGORIES } from '@/types'
import type { Product, Vendor } from '@/types'
import ProductsClient from './ProductsClient'

export const revalidate = 60

interface Props {
  searchParams: Promise<{
    category?: string
    sort?: string
    size?: string
    color?: string
    min_price?: string
    max_price?: string
  }>
}

type ProductWithVendor = Product & {
  vendors: Pick<Vendor, 'store_name' | 'slug' | 'logo_url'> | null
  flash_sales?: Array<{ discount_percent: number; starts_at: string; ends_at: string; is_active: boolean }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, sort = 'newest', size, color, min_price, max_price } = await searchParams
  const supabase = await createClient()

  // Main products query with filters
  let query = supabase
    .from('products')
    .select('*, vendors(store_name, slug, logo_url), flash_sales(discount_percent, starts_at, ends_at, is_active)')
    .eq('is_active', true)
    .gt('stock', 0)

  if (category && PRODUCT_CATEGORIES.includes(category as typeof PRODUCT_CATEGORIES[number])) {
    query = query.eq('category', category)
  }
  if (size) {
    query = query.contains('sizes', [size])
  }
  if (color) {
    query = query.contains('colors', [color])
  }
  if (min_price && !isNaN(parseFloat(min_price))) {
    query = query.gte('price', parseFloat(min_price))
  }
  if (max_price && !isNaN(parseFloat(max_price))) {
    query = query.lte('price', parseFloat(max_price))
  }

  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  // Fetch unique colors from all active products (for filter sidebar)
  const [mainResult, colorsResult] = await Promise.all([
    query.limit(60),
    supabase.from('products').select('colors').eq('is_active', true).gt('stock', 0),
  ])

  const products = (mainResult.data ?? []) as ProductWithVendor[]
  const uniqueColors = [...new Set(
    (colorsResult.data ?? []).flatMap((p) => p.colors ?? [])
  )].filter(Boolean).slice(0, 24)

  return (
    <SiteLayout>
      <ProductsClient
        products={products}
        uniqueColors={uniqueColors}
        filters={{ category, sort, size, color, min_price, max_price }}
      />
    </SiteLayout>
  )
}
