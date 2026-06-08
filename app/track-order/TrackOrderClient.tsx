'use client'

import { useState } from 'react'
import Image from 'next/image'
import { lookupOrder } from '@/app/actions/track-order'
import type { TrackingResult } from '@/app/actions/track-order'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'

const STEPS = [
  { key: 'pending',   label: 'Order Placed',  icon: '📋' },
  { key: 'confirmed', label: 'Confirmed',      icon: '✅' },
  { key: 'shipped',   label: 'Shipped',        icon: '🚚' },
  { key: 'delivered', label: 'Delivered',      icon: '🎉' },
]

const STATUS_LABELS: Record<string, string> = {
  pending:   'Order Placed',
  confirmed: 'Confirmed',
  shipped:   'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_number: 'Please enter a valid order number (e.g. AL-09A3E913).',
  not_found:      'No order found with this number. Check and try again.',
  phone_mismatch: 'The phone number does not match this order.',
}

export default function TrackOrderClient() {
  const [orderNum, setOrderNum] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TrackingResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNum.trim() || !phone.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const res = await lookupOrder(orderNum, phone)
    if (res.success) {
      setResult(res.data)
    } else {
      setError(ERROR_MESSAGES[res.error] ?? 'Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const statusIndex = result ? STEPS.findIndex((s) => s.key === result.status) : -1

  return (
    <div className="page-container">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--gray-mid)', marginBottom: 8 }}>
            MIO E-COMMERCE
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--black)', marginBottom: 12 }}>
            TRACK YOUR ORDER
          </h1>
          <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.6 }}>
            Enter your order number and the phone number used at checkout.
            <br />No account needed.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--black)', display: 'block', marginBottom: 6 }}>
                ORDER NUMBER
              </label>
              <input
                type="text"
                placeholder="AL-09A3E913"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--black)',
                  outline: 'none',
                  background: 'var(--white)',
                }}
                required
              />
              <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4 }}>
                Found in your order confirmation email (e.g. AL-09A3E913)
              </p>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--black)', display: 'block', marginBottom: 6 }}>
                PHONE NUMBER
              </label>
              <input
                type="tel"
                placeholder="+355 69 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--black)',
                  outline: 'none',
                  background: 'var(--white)',
                }}
                required
              />
              <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4 }}>
                Phone number you used during checkout
              </p>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px' }}>
                <p style={{ fontSize: 13, color: '#DC2626' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 4 }}
            >
              {loading ? 'SEARCHING…' : 'TRACK ORDER'}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Order header */}
            <div style={{ border: '2px solid var(--accent)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ background: 'var(--accent)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
                    ORDER
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: '0.1em', color: '#fff' }}>
                    {generateOrderNumber(result.id)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    background: result.status === 'delivered' ? '#D1FAE5' : result.status === 'cancelled' ? '#FEE2E2' : '#FEF9C3',
                    color: result.status === 'delivered' ? '#065F46' : result.status === 'cancelled' ? '#991B1B' : '#854D0E',
                    fontFamily: 'var(--font-display)',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    padding: '4px 12px',
                    borderRadius: 20,
                  }}>
                    {STATUS_LABELS[result.status] ?? result.status}
                  </span>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    {formatDate(result.created_at)}
                  </p>
                </div>
              </div>

              {/* Progress stepper */}
              {result.status !== 'cancelled' && (
                <div style={{ padding: '24px 24px 20px', background: 'var(--white)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {STEPS.map((step, i) => {
                      const isCompleted = statusIndex >= i
                      const isCurrent = statusIndex === i
                      const isLast = i === STEPS.length - 1
                      return (
                        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: isCompleted ? 'var(--accent)' : 'var(--gray-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: isCompleted ? 16 : 14,
                              border: isCurrent ? '3px solid var(--accent)' : '2px solid transparent',
                              boxShadow: isCurrent ? '0 0 0 3px rgba(35,47,62,0.15)' : 'none',
                              transition: 'all 0.2s',
                              flexShrink: 0,
                            }}>
                              {isCompleted ? (
                                <span style={{ color: '#fff', fontSize: 14 }}>✓</span>
                              ) : (
                                <span style={{ color: 'var(--gray-mid)', fontSize: 14 }}>{step.icon}</span>
                              )}
                            </div>
                            <span style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              color: isCompleted ? 'var(--black)' : 'var(--gray-mid)',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}>
                              {step.label.toUpperCase()}
                            </span>
                          </div>
                          {!isLast && (
                            <div style={{
                              flex: 1,
                              height: 2,
                              background: statusIndex > i ? 'var(--accent)' : 'var(--gray-light)',
                              margin: '0 6px',
                              marginBottom: 22,
                              transition: 'background 0.3s',
                            }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {result.status === 'cancelled' && (
                <div style={{ padding: '20px 24px', background: '#FFF5F5' }}>
                  <p style={{ fontSize: 13, color: '#DC2626' }}>This order has been cancelled.</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ background: 'var(--black)', padding: '12px 20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--white)' }}>
                  ORDERED ITEMS
                </p>
              </div>
              {result.order_items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--gray-light)', alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--gray-light)', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                    {item.products?.images?.[0] && (
                      <Image src={item.products.images[0]} alt={item.products.name ?? ''} fill className="object-cover" sizes="52px" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.products?.name}</p>
                    {(item.size || item.color) && (
                      <p style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--gray-dark)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 2 }}>Delivery to: <strong>{result.shipping_name}, {result.shipping_city}</strong></p>
                <p style={{ fontSize: 12, color: 'var(--gray-mid)' }}>💵 Cash on delivery</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'var(--gray-mid)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>TOTAL</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--black)' }}>{formatPrice(result.total)}</p>
              </div>
            </div>

            {/* Track another */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={() => { setResult(null); setOrderNum(''); setPhone(''); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gray-dark)', textDecoration: 'underline' }}
              >
                TRACK ANOTHER ORDER
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}
