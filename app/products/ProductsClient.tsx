'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toggleWishlist } from '@/app/actions/wishlist'
import { formatPrice, isFlashSaleActive, calculateFlashPrice } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/types'
import { useLanguage } from '@/lib/i18n'
import type { Product, Vendor } from '@/types'

type ProductWithVendor = Product & {
  vendors: Pick<Vendor, 'store_name' | 'slug' | 'logo_url'> | null
  flash_sales?: Array<{ discount_percent: number; starts_at: string; ends_at: string; is_active: boolean }>
}

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

interface Filters {
  category?: string
  sort: string
  size?: string
  color?: string
  min_price?: string
  max_price?: string
}

interface Props {
  products: ProductWithVendor[]
  uniqueColors: string[]
  filters: Filters
}

export default function ProductsClient({ products, uniqueColors, filters }: Props) {
  const router = useRouter()
  const { t } = useLanguage()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set())
  const [wishlistLoading, setWishlistLoading] = useState<Set<string>>(new Set())

  const [localSize, setLocalSize] = useState(filters.size ?? '')
  const [localColor, setLocalColor] = useState(filters.color ?? '')
  const [localMin, setLocalMin] = useState(filters.min_price ?? '')
  const [localMax, setLocalMax] = useState(filters.max_price ?? '')

  const buildParams = (overrides: Partial<Filters> = {}) => {
    const merged = {
      category: filters.category ?? '',
      sort: filters.sort,
      size: localSize,
      color: localColor,
      min_price: localMin,
      max_price: localMax,
      ...overrides,
    }
    const params = new URLSearchParams()
    if (merged.category) params.set('category', merged.category)
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort)
    if (merged.size) params.set('size', merged.size)
    if (merged.color) params.set('color', merged.color)
    if (merged.min_price) params.set('min_price', merged.min_price)
    if (merged.max_price) params.set('max_price', merged.max_price)
    return params
  }

  const applyFilters = (overrides?: Partial<Filters>) => {
    const params = buildParams(overrides)
    router.push(`/products${params.toString() ? '?' + params.toString() : ''}`)
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setLocalSize('')
    setLocalColor('')
    setLocalMin('')
    setLocalMax('')
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.sort !== 'newest') params.set('sort', filters.sort)
    router.push(`/products${params.toString() ? '?' + params.toString() : ''}`)
    setFiltersOpen(false)
  }

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlistLoading.has(productId)) return
    setWishlistLoading((prev) => new Set(prev).add(productId))
    const result = await toggleWishlist(productId)
    if (result.success) {
      setWishlistSet((prev) => {
        const next = new Set(prev)
        if (result.data!.added) next.add(productId)
        else next.delete(productId)
        return next
      })
    }
    setWishlistLoading((prev) => { const next = new Set(prev); next.delete(productId); return next })
  }

  const activeFilterCount = [filters.size, filters.color, filters.min_price || filters.max_price].filter(Boolean).length

  const filterContent = (
    <div className="filter-panel-content">
      <div className="filter-section">
        <p className="filter-label">{t('products.filter_size')}</p>
        <div className="filter-pills">
          {STANDARD_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setLocalSize(localSize === size ? '' : size)}
              className={`filter-pill${localSize === size ? ' active' : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {uniqueColors.length > 0 && (
        <div className="filter-section">
          <p className="filter-label">{t('products.filter_color')}</p>
          <div className="filter-pills">
            {uniqueColors.map((color) => (
              <button
                key={color}
                onClick={() => setLocalColor(localColor === color ? '' : color)}
                className={`filter-pill${localColor === color ? ' active' : ''}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-section">
        <p className="filter-label">{t('products.filter_price')}</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder={`${t('products.min_price')} €`}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="price-input"
            min={0}
          />
          <span style={{ color: 'var(--gray-mid)', fontSize: 12 }}>–</span>
          <input
            type="number"
            placeholder={`${t('products.max_price')} €`}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="price-input"
            min={0}
          />
        </div>
      </div>

      <button
        onClick={() => applyFilters()}
        className="btn-primary"
        style={{ width: '100%', marginBottom: 8 }}
      >
        {t('products.filters_btn')}
      </button>
      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="filter-clear-btn">
          {t('products.clear_filters')}
        </button>
      )}
    </div>
  )

  return (
    <div className="products-layout">
      {/* Desktop sidebar */}
      <aside className="filter-sidebar">
        <div className="filter-sidebar-header">
          <p className="filter-label-main">{t('products.filters_btn')}</p>
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </div>
        {filterContent}
      </aside>

      {/* Main area */}
      <div className="products-main">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--gray-mid)', marginBottom: 6 }}>
            {products.length} {t('products.count_label')}
          </p>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {filters.category ?? t('products.all_title')}
          </h1>
        </div>

        {/* Category pills + sort + mobile filter btn */}
        <div className="products-filter-row">
          <div className="category-pills">
            <Link
              href={`/products${filters.sort !== 'newest' ? `?sort=${filters.sort}` : ''}`}
              className={`category-pill${!filters.category ? ' active' : ''}`}
            >
              {t('products.all')}
            </Link>
            {PRODUCT_CATEGORIES.map((cat) => {
              const catParams = new URLSearchParams()
              catParams.set('category', cat)
              if (filters.sort !== 'newest') catParams.set('sort', filters.sort)
              if (filters.size) catParams.set('size', filters.size)
              if (filters.color) catParams.set('color', filters.color)
              if (filters.min_price) catParams.set('min_price', filters.min_price)
              if (filters.max_price) catParams.set('max_price', filters.max_price)
              return (
                <Link
                  key={cat}
                  href={`/products?${catParams.toString()}`}
                  className={`category-pill${filters.category === cat ? ' active' : ''}`}
                >
                  {cat.toUpperCase()}
                </Link>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button
              className="mobile-filter-btn"
              onClick={() => setFiltersOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              {t('products.filters_btn')}
              {activeFilterCount > 0 && (
                <span className="filter-count-badge">{activeFilterCount}</span>
              )}
            </button>

            <select
              value={filters.sort}
              onChange={(e) => {
                const params = buildParams({ sort: e.target.value })
                router.push(`/products${params.toString() ? '?' + params.toString() : ''}`)
              }}
              className="sort-select"
            >
              <option value="newest">{t('products.sort_newest')}</option>
              <option value="price_asc">{t('products.sort_price_asc')}</option>
              <option value="price_desc">{t('products.sort_price_desc')}</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {filters.size && (
              <span className="active-filter-chip">
                Size: {filters.size}
                <button onClick={() => applyFilters({ size: '' })}>✕</button>
              </span>
            )}
            {filters.color && (
              <span className="active-filter-chip">
                Color: {filters.color}
                <button onClick={() => applyFilters({ color: '' })}>✕</button>
              </span>
            )}
            {(filters.min_price || filters.max_price) && (
              <span className="active-filter-chip">
                €{filters.min_price || '0'} – €{filters.max_price || '∞'}
                <button onClick={() => applyFilters({ min_price: '', max_price: '' })}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Product grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-mid)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
            <p style={{ fontSize: 14, marginBottom: 8 }}>{t('products.empty')}</p>
            <Link href="/products" style={{ fontSize: 11, color: 'var(--accent)', borderBottom: '1px solid var(--accent)', textDecoration: 'none' }}>
              {t('products.view_all')}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => {
              const activeFlashSale = product.flash_sales?.find(isFlashSaleActive)
              const displayPrice = activeFlashSale
                ? calculateFlashPrice(product.price, activeFlashSale.discount_percent)
                : product.price
              const originalPrice = activeFlashSale ? product.price : product.compare_price
              const inWishlist = wishlistSet.has(product.id)

              return (
                <div key={product.id} style={{ position: 'relative' }}>
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="product-card">
                      <div className="product-card-image">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                            quality={80}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--gray-mid)', letterSpacing: '0.1em' }}>
                            {product.category?.toUpperCase().slice(0, 6)}
                          </div>
                        )}
                        {activeFlashSale && (
                          <span className="flash-badge">🔥 FLASH</span>
                        )}
                      </div>
                      <div className="product-card-info">
                        {product.vendors && (
                          <p className="product-card-store">{product.vendors.store_name.toUpperCase()}</p>
                        )}
                        <p className="product-card-name">{product.name}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span className="product-card-price">{formatPrice(displayPrice)}</span>
                          {originalPrice && originalPrice > displayPrice && (
                            <s style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{formatPrice(originalPrice)}</s>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Wishlist button outside Link to avoid nested interactive elements */}
                  <button
                    className={`wishlist-btn${inWishlist ? ' active' : ''}`}
                    onClick={(e) => handleWishlist(e, product.id)}
                    disabled={wishlistLoading.has(product.id)}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="filter-drawer-overlay" onClick={() => setFiltersOpen(false)}>
          <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drawer-header">
              <span>{t('products.filters_btn')}</span>
              <button onClick={() => setFiltersOpen(false)}>✕</button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </div>
  )
}
