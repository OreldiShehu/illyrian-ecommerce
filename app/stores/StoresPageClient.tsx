'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import type { VendorWithPlan } from '@/types'
import { getInitials } from '@/lib/utils'

interface Props {
  vendors: VendorWithPlan[]
  cities: string[]
  categories: string[]
  initialFilters: { q?: string; category?: string; city?: string; filter?: string }
}

function getAvgRating(vendor: VendorWithPlan): number {
  const reviews = (vendor as unknown as { vendor_reviews?: { rating: number }[] }).vendor_reviews ?? []
  if (!reviews.length) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

export default function StoresPageClient({ vendors, cities, categories, initialFilters }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(initialFilters.q ?? '')
  const [category, setCategory] = useState(initialFilters.category ?? 'all')
  const [city, setCity] = useState(initialFilters.city ?? 'all')
  const [minRating, setMinRating] = useState(0)
  const [onlyOffers, setOnlyOffers] = useState(initialFilters.filter === 'offers')
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
  }, [vendors, search, category, city, minRating, onlyOffers])

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
      <div style={{ background: 'var(--off-white)', borderBottom: '1px solid var(--border)', padding: '20px 40px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: '1 1 280px', margin: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Kërko dyqane…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ flex: '0 0 160px' }}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          >
            <option value="all">Të gjitha kategoritë</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="form-select"
            style={{ flex: '0 0 140px' }}
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1) }}
          >
            <option value="all">Të gjitha qytetet</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="form-select"
            style={{ flex: '0 0 160px' }}
            value={minRating}
            onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1) }}
          >
            <option value={0}>Çdo vlerësim</option>
            <option value={4}>★ 4+</option>
            <option value={4.5}>★ 4.5+</option>
          </select>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '11px 20px' }}>
            KËRKO
          </button>
        </form>
      </div>

      <div className="page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            DYQANET / STORES
          </h1>
          <p style={{ fontSize: 12, color: 'var(--gray-dark)' }}>
            {filtered.length} dyqane
          </p>
        </div>

        {paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-dark)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
            ASNJË DYQAN NUK U GJEt
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {paginated.map((vendor) => {
              const rating = getAvgRating(vendor)
              const plan = (vendor as unknown as { vendor_plans?: { plan: string }[] }).vendor_plans?.[0]?.plan
              const reviewCount = (vendor as unknown as { vendor_reviews?: unknown[] }).vendor_reviews?.length ?? 0

              return (
                <Link
                  key={vendor.id}
                  href={`/stores/${vendor.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div className="store-block" style={{ margin: 0, cursor: 'pointer' }}>
                    {vendor.banner_url && (
                      <div style={{ height: 80, position: 'relative', overflow: 'hidden' }}>
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
                    {vendor.bio && (
                      <div style={{ padding: '10px 20px', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                        {vendor.bio.slice(0, 100)}{vendor.bio.length > 100 ? '…' : ''}
                      </div>
                    )}
                    <div className="store-footer">
                      <span className="view-store-btn">SHIKO DYQANIN →</span>
                    </div>
                  </div>
                </Link>
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
