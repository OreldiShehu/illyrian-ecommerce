'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { VendorWithPlan } from '@/types'
import { getInitials } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'

type StoreProduct = { id: string; name: string; images: string[]; price: number; slug: string }

interface Props {
  vendors: VendorWithPlan[]
  cities: string[]
  categories: string[]
  productsByVendor: Record<string, StoreProduct[]>
  initialFilters: { q?: string; category?: string; city?: string; filter?: string }
}

function getAvgRating(vendor: VendorWithPlan): number {
  const reviews = (vendor as unknown as { vendor_reviews?: { rating: number }[] }).vendor_reviews ?? []
  if (!reviews.length) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

export default function StoresPageClient({ vendors, cities, categories, productsByVendor, initialFilters }: Props) {
  const router = useRouter()
  const { t } = useLanguage()
  const [search, setSearch] = useState(initialFilters.q ?? '')
  const [category, setCategory] = useState(initialFilters.category ?? 'all')
  const [city, setCity] = useState(initialFilters.city ?? 'all')
  const [minRating, setMinRating] = useState(0)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (search && !v.store_name.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'all' && v.category !== category) return false
      if (city !== 'all' && v.city !== city) return false
      if (minRating > 0 && getAvgRating(v) < minRating) return false
      return true
    })
  }, [vendors, search, category, city, minRating])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category !== 'all') params.set('category', category)
    if (city !== 'all') params.set('city', city)
    router.push(`/stores?${params.toString()}`)
    setPage(1)
  }

  return (
    <div className="page-container">
      {/* Search / Filter bar */}
      <div className="stores-filter-bar" style={{ background: 'var(--off-white)', borderBottom: '1px solid var(--border)', padding: '20px 40px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: '1 1 220px', margin: 0, minWidth: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={t('stores.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ flex: '1 1 130px', minWidth: 0 }}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          >
            <option value="all">{t('stores.all_categories')}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="form-select"
            style={{ flex: '1 1 120px', minWidth: 0 }}
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1) }}
          >
            <option value="all">{t('stores.all_cities')}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="form-select"
            style={{ flex: '1 1 120px', minWidth: 0 }}
            value={minRating}
            onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1) }}
          >
            <option value={0}>{t('stores.all_ratings')}</option>
            <option value={4}>★ 4+</option>
            <option value={4.5}>★ 4.5+</option>
          </select>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '11px 20px', flexShrink: 0 }}>
            {t('stores.search_btn')}
          </button>
        </form>
      </div>

      <div className="page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              {initialFilters.filter === 'offers' ? t('stores.title_offers') : initialFilters.filter === 'new' ? t('stores.title_new') : t('stores.title')}
            </h1>
            {initialFilters.filter && (
              <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                {initialFilters.filter === 'offers' ? t('stores.subtitle_offers') : t('stores.subtitle_new')}
              </p>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray-dark)' }}>
            {filtered.length} {t('stores.count_suffix')}
          </p>
        </div>

        {paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-dark)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
            {t('stores.empty')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {paginated.map((vendor) => {
              const rating = getAvgRating(vendor)
              const plan = (vendor as unknown as { vendor_plans?: { plan: string }[] }).vendor_plans?.[0]?.plan
              const reviewCount = (vendor as unknown as { vendor_reviews?: unknown[] }).vendor_reviews?.length ?? 0

              const storeProducts = productsByVendor[vendor.id] ?? []

              return (
                <div key={vendor.id} className="store-block" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Store header — clickable */}
                  <Link href={`/stores/${vendor.slug}`} style={{ textDecoration: 'none' }}>
                    {vendor.banner_url && (
                      <div style={{ height: 72, position: 'relative', overflow: 'hidden' }}>
                        <Image src={vendor.banner_url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="store-head">
                      <div className="store-info">
                        <div className="store-avatar">
                          {vendor.logo_url ? (
                            <Image src={vendor.logo_url} alt={vendor.store_name} width={42} height={42} className="object-cover" />
                          ) : getInitials(vendor.store_name)}
                        </div>
                        <div>
                          <div className="store-name">
                            {vendor.store_name.toUpperCase()}
                            {vendor.is_verified && <span style={{ color: '#C9A84C', marginLeft: 6 }}>✓</span>}
                          </div>
                          <div className="store-meta">
                            {vendor.category} · {vendor.city}
                            {rating > 0 && ` · ★ ${rating.toFixed(1)} (${reviewCount})`}
                          </div>
                        </div>
                      </div>
                      {plan === 'pro' && <div className="store-badge offer">PRO</div>}
                    </div>
                  </Link>

                  {/* Horizontal product scroll */}
                  {storeProducts.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: 8,
                      overflowX: 'auto',
                      padding: '12px 16px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                      className="store-products-scroll"
                    >
                      {storeProducts.map((p) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          style={{ textDecoration: 'none', flexShrink: 0 }}
                        >
                          <div style={{ width: 100 }}>
                            <div style={{ width: 100, height: 100, borderRadius: 8, background: 'var(--gray-light)', position: 'relative', overflow: 'hidden', marginBottom: 6 }}>
                              {p.images?.[0] ? (
                                <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="100px" />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: 'var(--gray-light)' }} />
                              )}
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--black)', lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                              {p.name}
                            </p>
                            <p style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-dark)' }}>
                              €{p.price.toFixed(2)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <Link href={`/stores/${vendor.slug}`} style={{ textDecoration: 'none', marginTop: 'auto' }}>
                    <div className="store-footer">
                      <span className="view-store-btn">{t('stores.view_store')}</span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  width: 36,
                  height: 36,
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  background: page === i + 1 ? 'var(--black)' : 'transparent',
                  color: page === i + 1 ? 'var(--white)' : 'var(--black)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
