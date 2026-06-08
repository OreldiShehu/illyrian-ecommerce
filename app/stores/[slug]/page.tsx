import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import StoreProductsClient from './StoreProductsClient'
import { getInitials, formatPrice } from '@/lib/utils'
import { getT } from '@/lib/i18n-server'
import type { Product, VendorReview, User } from '@/types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  const [supabase, t] = await Promise.all([createClient(), getT()])

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('status', 'active')
    .single()

  if (!vendor) notFound()

  const [productsResult, reviewsResult, planResult] = await Promise.all([
    supabase
      .from('products')
      .select('*, flash_sales(discount_percent, starts_at, ends_at, is_active)')
      .eq('vendor_id', vendor.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),

    supabase
      .from('vendor_reviews')
      .select('*, users(name, avatar_url)')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('vendor_plans')
      .select('plan')
      .eq('vendor_id', vendor.id)
      .single(),
  ])

  const products = (productsResult.data ?? []) as Product[]
  const reviews = (reviewsResult.data ?? []) as (VendorReview & { users: Pick<User, 'name' | 'avatar_url'> | null })[]
  const plan = planResult.data?.plan ?? 'free'

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  return (
    <SiteLayout>
      {/* Banner */}
      <div style={{ position: 'relative', height: 200, background: '#232F3E', overflow: 'hidden' }}>
        {vendor.banner_url ? (
          <Image src={vendor.banner_url} alt={vendor.store_name} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))' }} />
      </div>

      {/* Store header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
          {/* Logo + name row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 20 }}>
            {/* Logo — overlaps banner */}
            <div style={{
              width: 84, height: 84, borderRadius: 16, overflow: 'hidden',
              border: '3px solid var(--white)', marginTop: -42, flexShrink: 0,
              background: '#232F3E', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--white)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}>
              {vendor.logo_url ? (
                <Image src={vendor.logo_url} alt={vendor.store_name} width={84} height={84} className="object-cover" />
              ) : getInitials(vendor.store_name)}
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, paddingBottom: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--black)', lineHeight: 1 }}>
                  {vendor.store_name.toUpperCase()}
                </h1>
                {vendor.is_verified && (
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', color: '#C9A84C', border: '1px solid #C9A84C', borderRadius: 4, padding: '2px 6px' }}>
                    {t('store.verified')}
                  </span>
                )}
                {plan === 'pro' && (
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', background: '#111', color: '#fff', borderRadius: 4, padding: '2px 8px' }}>
                    PRO
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-mid)', lineHeight: 1.5 }}>
                {[vendor.category, vendor.city, avgRating > 0 ? `★ ${avgRating.toFixed(1)} (${reviews.length})` : null, `${products.length} ${t('store.products_unit')}`].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* WhatsApp button */}
            {vendor.whatsapp && (
              <a
                href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                  padding: '9px 18px', background: '#25D366', color: '#fff',
                  borderRadius: 8, textDecoration: 'none', flexShrink: 0,
                  fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.797 1.832 6.793L2 30l7.418-1.805A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"/>
                </svg>
                WHATSAPP
              </a>
            )}
          </div>

          {/* Bio */}
          {vendor.bio && (
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.7, paddingBottom: 20, maxWidth: 680 }}>
              {vendor.bio}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="page-inner">
        <StoreProductsClient products={products} />

        {/* Reviews */}
        {reviews.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 20 }}>
              {t('store.reviews')} ({reviews.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>
                      {review.users?.name ?? 'Anonim'}
                    </span>
                    <span style={{ color: '#C9A84C', fontSize: 14 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.6 }}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  )
}
