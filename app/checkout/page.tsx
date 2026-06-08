'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore, selectSubtotal, selectDiscount, selectLoyaltyDiscount, selectDeliveryFee, selectTotal } from '@/store/cart'
import { placeOrder, validateCoupon } from '@/app/actions/checkout'
import { ALBANIAN_CITIES } from '@/types'
import { formatPrice } from '@/lib/utils'
import SiteLayout from '@/components/layout/SiteLayout'
import type { Coupon } from '@/types'

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const items = useCartStore((s) => s.items)
  const coupon = useCartStore((s) => s.coupon)
  const loyaltyPointsUsed = useCartStore((s) => s.loyaltyPointsUsed)
  const subtotal = useCartStore(selectSubtotal)
  const discount = useCartStore(selectDiscount)
  const loyaltyDiscount = useCartStore(selectLoyaltyDiscount)
  const deliveryFee = useCartStore(selectDeliveryFee)
  const total = useCartStore(selectTotal)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => { setMounted(true) }, [])

  const handleCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const result = await validateCoupon(couponCode.trim(), subtotal)
    if (result.success) {
      applyCoupon(result.data!.coupon as unknown as Coupon)
      setCouponCode('')
    } else {
      setCouponError(result.error ?? 'Kodi i pavlefshëm.')
    }
    setCouponLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (items.length === 0) { setError('Shporta juaj është bosh.'); return }
    setSubmitting(true)
    setError('')

    try {
      const fd = new FormData(e.currentTarget)
      const result = await placeOrder({
        name: fd.get('name') as string,
        phone: fd.get('phone') as string,
        address: fd.get('address') as string,
        city: fd.get('city') as string,
        notes: fd.get('notes') as string,
        couponCode: coupon?.code,
        loyaltyPointsUsed,
        items,
      })

      if (result && !result.success) {
        setError(result.error ?? 'Porosia dështoi.')
        setSubmitting(false)
      }
      // On success, action redirects to /order-confirmed/[id]
    } catch (e: unknown) {
      // Next.js redirect() throws internally — let it propagate so navigation works
      if (typeof e === 'object' && e !== null && 'digest' in e) throw e
      setError('Gabim i papritur. Provoni përsëri.')
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <SiteLayout>
        <div className="page-inner" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="skeleton" style={{ width: 200, height: 24 }} />
        </div>
      </SiteLayout>
    )
  }

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="page-inner" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.15em', color: 'var(--gray-dark)', marginBottom: 24 }}>
            SHPORTA JUAJ ËSHTË BOSH
          </p>
          <Link href="/stores" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '13px 28px', width: 'auto' }}>
            EKSPLORONI DYQANET
          </Link>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="page-inner">
        <h1 className="page-title">CHECKOUT</h1>

        <form onSubmit={handleSubmit}>
          <div className="checkout-grid">
            {/* Left: Delivery form */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--black)' }}>
                ADRESA E DORËZIMIT
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="name">Emri i plotë *</label>
                  <input id="name" name="name" type="text" className="form-input" required placeholder="Emri Mbiemri" autoComplete="name" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="phone">Numri i telefonit *</label>
                  <input id="phone" name="phone" type="tel" className="form-input" required placeholder="+355 6X XXX XXXX" autoComplete="tel" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="address">Adresa *</label>
                  <input id="address" name="address" type="text" className="form-input" required placeholder="Rruga, nr. 12, kati 3" autoComplete="street-address" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">Qyteti *</label>
                  <select id="city" name="city" className="form-select" required>
                    {ALBANIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Apartament / Shënime</label>
                  <input id="notes" name="notes" type="text" className="form-input" placeholder="Apartamenti, ndërtesa, etj." />
                </div>
              </div>

              {/* Payment */}
              <div style={{ marginTop: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid var(--black)' }}>
                  MËNYRA E PAGESËS
                </h2>
                <div style={{ border: '2px solid var(--black)', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--white)' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>PAGUAJ ME DORËZIM (CASH)</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginTop: 2 }}>Paguani me cash kur të merrni porosinë</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order summary */}
            <div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: 'var(--black)', padding: '16px 20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--white)' }}>
                    PËRMBLEDHJA E POROSISË
                  </h2>
                </div>

                <div style={{ padding: '16px 20px' }}>
                  {/* Items */}
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--gray-light)' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 6, background: '#252525', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.size, item.color)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-mid)', fontSize: 16, lineHeight: 1, padding: '0 0 0 8px', flexShrink: 0 }}
                            title="Hiq"
                          >×</button>
                        </div>
                        {(item.size || item.color) && (
                          <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>
                            {[item.size, item.color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ fontSize: 12, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}

                  {/* Coupon */}
                  <div style={{ marginBottom: 16 }}>
                    {coupon ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#D1FAE5', padding: '8px 12px', borderRadius: 6 }}>
                        <span style={{ fontSize: 12, color: '#065F46', fontWeight: 700 }}>KOD: {coupon.code}</span>
                        <button type="button" onClick={removeCoupon} style={{ fontSize: 11, color: '#065F46', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>HIQE</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Kodi i zbritjes"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          style={{ flex: 1 }}
                        />
                        <button type="button" onClick={handleCoupon} disabled={couponLoading} className="btn-secondary" style={{ padding: '10px 12px', fontSize: 10, whiteSpace: 'nowrap' }}>
                          {couponLoading ? '…' : 'APLIKO'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="form-error" style={{ marginTop: 4 }}>{couponError}</p>}
                  </div>

                  {/* Totals */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--gray-dark)' }}>Nëntotali</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--gray-dark)' }}>Zbritja</span>
                        <span style={{ color: '#16a34a' }}>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    {loyaltyDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--gray-dark)' }}>Pikë besnikërie</span>
                        <span style={{ color: '#16a34a' }}>-{formatPrice(loyaltyDiscount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--gray-dark)' }}>Dërgesa</span>
                      <span>{deliveryFee === 0 ? 'Falas' : formatPrice(deliveryFee)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, paddingTop: 8, borderTop: '2px solid var(--black)', marginTop: 4 }}>
                      <span>TOTALI</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 20px 20px' }}>
                  {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'DUKE POROSITUR…' : `POROSIT — ${formatPrice(total)}`}
                  </button>
                  <p style={{ fontSize: 11, color: 'var(--gray-dark)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                    💵 Pagesa me cash gjatë dorëzimit<br />
                    🕐 Dorëzim: 2-3 ditë pune
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </SiteLayout>
  )
}
