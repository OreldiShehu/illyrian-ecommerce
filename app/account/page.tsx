import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import AccountClient from './AccountClient'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'
import type { OrderWithItems, LoyaltyPoint, Wishlist, Product } from '@/types'
import { ORDER_STATUSES } from '@/types'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?returnUrl=/account')

  const [userResult, ordersResult, wishlistResult, loyaltyResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),

    supabase
      .from('orders')
      .select('*, order_items(*, products(id, name, slug, images), vendors(id, store_name, slug))')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('wishlists')
      .select('*, products(id, name, slug, price, compare_price, images)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const userData = userResult.data
  const orders = (ordersResult.data ?? []) as unknown as OrderWithItems[]
  const wishlistItems = (wishlistResult.data ?? []) as (Wishlist & { products: Product | null })[]
  const loyaltyHistory = (loyaltyResult.data ?? []) as LoyaltyPoint[]
  const loyaltyBalance = loyaltyHistory.reduce((s, l) => s + l.points, 0)

  return (
    <SiteLayout>
      <AccountClient
        user={userData}
        orders={orders}
        wishlistItems={wishlistItems}
        loyaltyHistory={loyaltyHistory}
        loyaltyBalance={loyaltyBalance}
      />
    </SiteLayout>
  )
}
