import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import StoreProductsClient from './StoreProductsClient'
import { getInitials, formatPrice } from '@/lib/utils'
import type { Product, VendorReview, User } from '@/types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

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
      <div style={{ position: 'relative', height: 220, background: '#252525', overflow: 'hidden' }}>
        {vendor.banner_url ? (
          <Image src={vendor.banner_url} alt={vendor.store_name} fill className="object-cover" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1f1f1f, #444)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))' }} />
      </div>

      {/* Store header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '20px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: '3px solid var(--white)', marginTop: -36, flexShrink: 0, background: '#252525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--white)' }}>
            {vendor.logo_url ? (
              <Image src={vendor.logo_url} alt={vendor.store_name} width={72} height={72} className="object-cover" />
            ) : getInitials(vendor.store_name)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--black)', marginBottom: 4 }}>
              {vendor.store_name.toUpperCase()}
              {vendor.is_verified && <span title="Dyqan i verifikuar" style={{ color: '#C9A84C', marginLeft: 8, fontSize: 16 }}>✓ VERIFIKUAR</span>}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--gray-dark)' }}>
              {vendor.category} · {vendor.city}
              {avgRating > 0 && ` · ★ ${avgRating.toFixed(1)} (${reviews.length} recensione)`}
              {` · ${products.length} produkte`}
            </p>
            {vendor.bio && (
              <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginTop: 8, lineHeight: 1.6, maxWidth: 600 }}>{vendor.bio}</p>
            )}
          </div>
          {vendor.whatsapp && (
            <a
              href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21" /><path d="M9 10c0 5 3.5 7.5 6 5" />
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
              RECENSIONE ({reviews.length})
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
