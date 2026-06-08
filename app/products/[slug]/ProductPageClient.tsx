'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { toggleWishlist } from '@/app/actions/wishlist'
import { submitReview } from '@/app/actions/review'
import type { ProductWithVendor, Review, User } from '@/types'
import { formatPrice, getInitials, isFlashSaleActive, calculateFlashPrice, getFlashSaleTimeLeft } from '@/lib/utils'
import SizingGuide from '@/components/SizingGuide'

interface Props {
  product: ProductWithVendor
  reviews: (Review & { users: Pick<User, 'name' | 'avatar_url'> | null })[]
  isInWishlist: boolean
  canReview: boolean
  isLoggedIn: boolean
}

export default function ProductPageClient({ product, reviews, isInWishlist: initialWishlist, canReview, isLoggedIn }: Props) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '')
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [inWishlist, setInWishlist] = useState(initialWishlist)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reviewError, setReviewError] = useState('')

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const activeFlashSale = (product.flash_sales ?? []).find(isFlashSaleActive)
  const displayPrice = activeFlashSale
    ? calculateFlashPrice(product.price, activeFlashSale.discount_percent)
    : product.price
  const originalPrice = activeFlashSale ? product.price : product.compare_price

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  useEffect(() => {
    if (!activeFlashSale) return
    const timer = setInterval(() => setCountdown(getFlashSaleTimeLeft(activeFlashSale.ends_at)), 1000)
    return () => clearInterval(timer)
  }, [activeFlashSale])

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) return
    addItem({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      comparePrice: originalPrice ?? undefined,
      image: product.images[0] ?? '',
      slug: product.slug,
      vendorId: product.vendors.id,
      vendorName: product.vendors.store_name,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      stock: product.stock,
    }, quantity)
    openCart()
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleToggleWishlist = async () => {
    if (!isLoggedIn) { window.location.href = '/auth/login'; return }
    setWishlistLoading(true)
    const result = await toggleWishlist(product.id)
    if (result.success) setInWishlist(result.data!.added)
    setWishlistLoading(false)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewStatus('loading')
    const result = await submitReview(product.id, product.slug, reviewRating, reviewComment)
    if (result.success) {
      setReviewStatus('success')
    } else {
      setReviewStatus('error')
      setReviewError(result.error ?? 'Gabim.')
    }
  }

  return (
    <div className="page-inner">
      {/* Flash sale banner */}
      {activeFlashSale && (
        <div style={{ background: 'var(--black)', color: 'var(--white)', padding: '12px 20px', borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>
            🔥 FLASH SALE — -{Math.round(activeFlashSale.discount_percent)}% ZBRITJE
          </span>
          <span className="countdown">{countdown}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        {/* Images */}
        <div>
          <div style={{ aspectRatio: '1', background: '#f0f1f2', borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 12 }}>
            {product.images[selectedImage] ? (
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" priority quality={90} sizes="(max-width: 900px) 90vw, 50vw" />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
                {product.category?.toUpperCase()}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: `2px solid ${selectedImage === i ? 'var(--black)' : 'var(--border)'}`, padding: 0, cursor: 'pointer', position: 'relative', background: '#f0f1f2' }}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Breadcrumb */}
          <p style={{ fontSize: 11, color: 'var(--gray-mid)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 8 }}>
            <Link href="/stores" style={{ color: 'var(--gray-mid)' }}>DYQANET</Link>
            {' / '}
            <Link href={`/stores/${product.vendors.slug}`} style={{ color: 'var(--gray-mid)' }}>
              {product.vendors.store_name.toUpperCase()}
            </Link>
            {' / '}
            {product.name.toUpperCase()}
          </p>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '0.06em', color: 'var(--black)', marginBottom: 12 }}>
            {product.name}
          </h1>

          {avgRating > 0 && (
            <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 12 }}>
              {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))} {avgRating.toFixed(1)} ({reviews.length} komente)
            </p>
          )}

          {/* Price */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--black)' }}>
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span style={{ marginLeft: 12, fontSize: 18, color: 'var(--gray-mid)', textDecoration: 'line-through' }}>
                {formatPrice(originalPrice)}
              </span>
            )}
            {activeFlashSale && (
              <span style={{ marginLeft: 10, background: '#C9A84C', color: '#000', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                -{Math.round(activeFlashSale.discount_percent)}%
              </span>
            )}
          </div>

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--black)' }}>
                  MADHËSIA: {selectedSize}
                </p>
                <SizingGuide />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{ padding: '8px 16px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, border: `2px solid ${selectedSize === size ? 'var(--black)' : 'var(--border)'}`, background: selectedSize === size ? 'var(--black)' : 'transparent', color: selectedSize === size ? 'var(--white)' : 'var(--black)', borderRadius: 6, cursor: 'pointer' }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--black)', marginBottom: 8 }}>
                NGJYRA: {selectedColor}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{ padding: '6px 14px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, border: `2px solid ${selectedColor === color ? 'var(--black)' : 'var(--border)'}`, background: selectedColor === color ? 'var(--black)' : 'transparent', color: selectedColor === color ? 'var(--white)' : 'var(--black)', borderRadius: 6, cursor: 'pointer' }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em' }}>SASIA:</p>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>−</button>
              <span style={{ width: 40, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>+</button>
            </div>
            <span style={{ fontSize: 12, color: product.stock < 5 ? '#ef4444' : 'var(--gray-dark)' }}>
              {product.stock} disponibël
            </span>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary"
              style={{ flex: 1, background: addedToCart ? '#16a34a' : undefined }}
            >
              {product.stock === 0 ? 'STOKU I MBARUAR' : addedToCart ? 'U SHTUA ✓' : 'SHTO NË SHPORTË'}
            </button>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className="btn-secondary"
              style={{ padding: '12px 16px' }}
              title={inWishlist ? 'Hiq nga lista e dëshirave' : 'Shto në listën e dëshirave'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 10 }}>PËRSHKRIMI</p>
              <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.8 }}>{product.description}</p>
            </div>
          )}

          {/* Vendor */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 12 }}>SHITËSI</p>
            <Link href={`/stores/${product.vendors.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#232F3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#ffffff', overflow: 'hidden', flexShrink: 0 }}>
                {product.vendors.logo_url ? (
                  <Image src={product.vendors.logo_url} alt={product.vendors.store_name} width={44} height={44} className="object-cover" />
                ) : getInitials(product.vendors.store_name)}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--black)' }}>
                  {product.vendors.store_name.toUpperCase()}
                  {product.vendors.is_verified && <span style={{ color: '#C9A84C', marginLeft: 6 }}>✓</span>}
                </p>
                <p style={{ fontSize: 11, color: 'var(--gray-dark)' }}>{product.vendors.city}</p>
              </div>
            </Link>
            {product.vendors.whatsapp && (
              <a
                href={`https://wa.me/${product.vendors.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21" /><path d="M9 10c0 5 3.5 7.5 6 5" />
                </svg>
                KONTAKTO SHITËSIN
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40, marginTop: 48 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 24 }}>
          KOMENTE ({reviews.length})
        </h2>

        {/* Submit review */}
        {canReview && reviewStatus !== 'success' && (
          <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 32 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 16 }}>
              SHKRUAJ KOMENTIN TËNd
            </p>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#C9A84C' : 'var(--gray-light)' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="form-textarea"
                placeholder="Shkruaj komentin tënd (opsionale)…"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                style={{ marginBottom: 12 }}
              />
              {reviewStatus === 'error' && <p className="form-error" style={{ marginBottom: 8 }}>{reviewError}</p>}
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} disabled={reviewStatus === 'loading'}>
                {reviewStatus === 'loading' ? 'DUKE DËRGUAR…' : 'DËRGO KOMENTIN'}
              </button>
            </form>
          </div>
        )}

        {reviewStatus === 'success' && (
          <div style={{ background: '#D1FAE5', border: '1px solid #34D399', borderRadius: 8, padding: '12px 20px', marginBottom: 24, fontSize: 13, color: '#065F46' }}>
            Komenti juaj u dërgua me sukses!
          </div>
        )}

        {reviews.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--gray-dark)', fontStyle: 'italic' }}>
            Ende asnjë koment. Bëni të parin!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>
                    {review.users?.name ?? 'Anonim'}
                  </span>
                  <span style={{ color: '#C9A84C', fontSize: 14 }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.6 }}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
