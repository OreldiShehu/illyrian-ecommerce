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
      {/* Store hero banner — logo, name, bio all inside */}
      <div style={{ position: 'relative', minHeight: 300, background: '#232F3E', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* Background image */}
        {vendor.banner_url && (
          <Image src={vendor.banner_url} alt={vendor.store_name} fill className="object-cover" sizes="100vw" priority />
        )}
        {/* Dark gradient overlay — always present for readability */}
        <div style={{ position: 'absolute', inset: 0, background: vendor.banner_url ? 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)' : 'linear-gradient(135deg, #1a2530 0%, #232F3E 100%)' }} />

        {/* Content inside banner */}
        <div className="store-hero-content" style={{ position: 'relative', zIndex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 40px' }}>
          {/* Logo */}
          <div style={{
            width: 96, height: 96, borderRadius: 18, overflow: 'hidden', flexShrink: 0,
            border: '3px solid rgba(255,255,255,0.9)',
            background: '#1a2530', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {vendor.logo_url ? (
              <Image src={vendor.logo_url} alt={vendor.store_name} width={96} height={96} className="object-cover" />
            ) : getInitials(vendor.store_name)}
          </div>

          {/* Name + meta + bio */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, letterSpacing: '0.08em', color: '#fff', lineHeight: 1 }}>
                {vendor.store_name.toUpperCase()}
              </h1>
              {vendor.is_verified && (
                <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 4, padding: '2px 7px' }}>
                  {t('store.verified')}
                </span>
              )}
              {plan === 'pro' && (
                <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 4, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.3)' }}>
                  PRO
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: vendor.bio ? 10 : 0 }}>
              {[vendor.category, vendor.city, avgRating > 0 ? `★ ${avgRating.toFixed(1)} (${reviews.length})` : null, `${products.length} ${t('store.products_unit')}`].filter(Boolean).join(' · ')}
            </p>
            {vendor.bio && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, maxWidth: 620 }}>
                {vendor.bio}
              </p>
            )}
          </div>

          {/* WhatsApp button */}
          {vendor.whatsapp && (
            <a
              href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="store-hero-whatsapp"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                padding: '11px 20px', background: '#25D366', color: '#fff',
                borderRadius: 10, textDecoration: 'none',
                fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.797 1.832 6.793L2 30l7.418-1.805A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"/>
              </svg>
              WHATSAPP
            </a>
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
