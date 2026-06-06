'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { formatPrice, isFlashSaleActive, calculateFlashPrice } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/types'

interface Props {
  products: (Product & { flash_sales?: Array<{ discount_percent: number; starts_at: string; ends_at: string; is_active: boolean }> })[]
}

export default function StoreProductsClient({ products }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'all' && p.category !== category) return false
      return true
    })
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.price - b.price)
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, search, category, sortBy])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: '1 1 220px', margin: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Kërko produkte…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="form-select" style={{ flex: '0 0 160px' }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
          <option value="all">Të gjitha</option>
          {[...PRODUCT_CATEGORIES].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" style={{ flex: '0 0 160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Më të rejat</option>
          <option value="price_asc">Çmimi: i ulët–i lartë</option>
          <option value="price_desc">Çmimi: i lartë–i ulët</option>
        </select>
      </div>

      {/* Grid */}
      {paginated.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-dark)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', fontSize: 13 }}>
          ASNJË PRODUKT NUK U GJEt
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {paginated.map((product) => {
            const flashSale = product.flash_sales?.find(isFlashSaleActive)
            const displayPrice = flashSale ? calculateFlashPrice(product.price, flashSale.discount_percent) : product.price
            const originalPrice = flashSale ? product.price : product.compare_price

            return (
              <Link key={product.id} href={`/products/${product.slug}`} style={{ display: 'block' }}>
                <div style={{ background: '#252525', borderRadius: 10, overflow: 'hidden', transition: 'transform 0.2s' }} className="product-card-grid">
                  <div style={{ aspectRatio: '1', background: 'linear-gradient(145deg, #252525, #111)', position: 'relative' }}>
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="220px" />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                          {product.category?.toUpperCase().slice(0, 6)}
                        </span>
                      </div>
                    )}
                    {flashSale && (
                      <div className="product-tag" style={{ background: '#C9A84C', color: '#000' }}>🔥 -{Math.round(flashSale.discount_percent)}%</div>
                    )}
                    {!flashSale && product.compare_price && product.compare_price > product.price && (
                      <div className="product-tag">OFERTË</div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px 14px' }}>
                    <p className="product-name">{product.name}</p>
                    <p className="product-price">
                      {formatPrice(displayPrice)}
                      {originalPrice && originalPrice > displayPrice && <s>{formatPrice(originalPrice)}</s>}
                    </p>
                    {product.stock < 3 && product.stock > 0 && (
                      <p style={{ fontSize: 10, color: '#ef4444', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', marginTop: 4 }}>
                        VETËM {product.stock} TË MBETURA
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {Array.from({ length: Math.ceil(filtered.length / PAGE_SIZE) }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ width: 36, height: 36, fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, background: page === i + 1 ? 'var(--black)' : 'transparent', color: page === i + 1 ? 'var(--white)' : 'var(--black)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
