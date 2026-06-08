'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'

type SearchResult = {
  products: Array<{ id: string; name: string; price: number; slug: string; images: string[]; category: string }>
  stores: Array<{ id: string; store_name: string; slug: string; logo_url: string | null; category: string; city: string }>
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ products: [], stores: [] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { t } = useLanguage()

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults({ products: [], stores: [] }); return }
    setLoading(true)
    const [productsRes, storesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, price, slug, images, category')
        .eq('is_active', true)
        .ilike('name', `%${q}%`)
        .limit(6),
      supabase
        .from('vendors')
        .select('id, store_name, slug, logo_url, category, city')
        .eq('is_active', true)
        .eq('status', 'active')
        .ilike('store_name', `%${q}%`)
        .limit(4),
    ])
    setResults({ products: productsRes.data ?? [], stores: storesRes.data ?? [] })
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 280)
    return () => clearTimeout(timer)
  }, [query, search])

  const hasResults = results.products.length > 0 || results.stores.length > 0

  return (
    <div
      className="search-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="search-panel">
        <div className="search-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--gray-mid)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-overlay-input"
          />
          <button onClick={onClose} className="search-close-btn">ESC</button>
        </div>

        {query.length >= 2 && (
          <div className="search-results">
            {loading && (
              <div className="search-loading">
                <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>•••</span>
              </div>
            )}

            {!loading && !hasResults && (
              <p className="search-no-results">{t('search.no_results')}</p>
            )}

            {!loading && results.stores.length > 0 && (
              <div className="search-section">
                <p className="search-section-heading">{t('search.stores_heading')}</p>
                {results.stores.map((store) => (
                  <Link key={store.id} href={`/stores/${store.slug}`} onClick={onClose} className="search-result-item">
                    <div className="search-result-avatar">
                      {store.logo_url ? (
                        <Image src={store.logo_url} alt={store.store_name} width={36} height={36} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      ) : (
                        <span>{store.store_name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="search-result-name">{store.store_name}</p>
                      <p className="search-result-meta">{store.category} · {store.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && results.products.length > 0 && (
              <div className="search-section">
                <p className="search-section-heading">{t('search.products_heading')}</p>
                {results.products.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`} onClick={onClose} className="search-result-item">
                    <div className="search-result-thumb">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} width={40} height={40} style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: 6 }} />
                      ) : (
                        <div className="search-result-thumb-placeholder">{product.category?.slice(0, 3)}</div>
                      )}
                    </div>
                    <div>
                      <p className="search-result-name">{product.name}</p>
                      <p className="search-result-price">€{product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
