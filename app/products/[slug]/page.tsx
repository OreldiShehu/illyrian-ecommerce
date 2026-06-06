import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import ProductPageClient from './ProductPageClient'
import type { ProductWithVendor, Review, User } from '@/types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, vendors(id, store_name, slug, logo_url, whatsapp, city, is_verified), flash_sales(discount_percent, starts_at, ends_at, is_active)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const [reviewsResult, wishlistResult, canReviewResult] = await Promise.all([
    supabase
      .from('reviews')
      .select('*, users(name, avatar_url)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false }),

    user
      ? supabase.from('wishlists').select('id').eq('user_id', user.id).eq('product_id', product.id).single()
      : Promise.resolve({ data: null }),

    user
      ? supabase
          .from('orders')
          .select('id, order_items!inner(product_id)')
          .eq('customer_id', user.id)
          .eq('status', 'delivered')
          .eq('order_items.product_id', product.id)
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const reviews = (reviewsResult.data ?? []) as (Review & { users: Pick<User, 'name' | 'avatar_url'> | null })[]
  const isInWishlist = !!wishlistResult.data
  const canReview = !!canReviewResult.data && !reviews.find((r) => r.customer_id === user?.id)

  return (
    <SiteLayout>
      <ProductPageClient
        product={product as unknown as ProductWithVendor}
        reviews={reviews}
        isInWishlist={isInWishlist}
        canReview={canReview}
        isLoggedIn={!!user}
      />
    </SiteLayout>
  )
}
