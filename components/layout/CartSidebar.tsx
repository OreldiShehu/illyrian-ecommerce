'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useCartStore, selectSubtotal, selectItemCount } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function CartSidebar() {
  const cartOpen = useCartStore((s) => s.cartOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const subtotal = useCartStore(selectSubtotal)
  const itemCount = useCartStore(selectItemCount)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeCart])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          onClick={closeCart}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 400,
        maxWidth: '100vw',
        height: '100vh',
        background: 'var(--white)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 900, letterSpacing: '0.15em' }}>
            SHPORTA {itemCount > 0 && `(${itemCount})`}
          </h2>
          <button onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--gray-mid)', lineHeight: 1 }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.15em', color: 'var(--gray-mid)', marginBottom: 20 }}>SHPORTA ËSHTË BOSH</p>
              <Link href="/stores" onClick={closeCart} className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px', width: 'auto', fontSize: 11 }}>
                SHIKO DYQANET
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} style={{ display: 'flex', gap: 14, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--gray-light)' }}>
                <div style={{ width: 72, height: 72, borderRadius: 8, background: '#f3f3f3', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="72px" unoptimized />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</p>
                    <button onClick={() => removeItem(item.productId, item.size, item.color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-mid)', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
                  </div>
                  {(item.size || item.color) && (
                    <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 2 }}>{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)} style={{ width: 26, height: 26, borderRadius: 4, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)} style={{ width: 26, height: 26, borderRadius: 4, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 24px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--gray-dark)' }}>Nëntotali</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900 }}>{formatPrice(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary"
              style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '14px', fontSize: 13 }}
            >
              VAZHDO ME BLERJEN
            </Link>
            <button onClick={closeCart} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--gray-mid)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
              VAZHDONI BLERJEN
            </button>
          </div>
        )}
      </div>
    </>
  )
}
