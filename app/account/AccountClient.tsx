'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { removeFromWishlist } from '@/app/actions/wishlist'
import { updateProfile } from '@/app/actions/auth'
import type { User, OrderWithItems, LoyaltyPoint, Wishlist, Product } from '@/types'
import { formatPrice, formatDate, generateOrderNumber, loyaltyPointsToEuros, getInitials } from '@/lib/utils'
import { ORDER_STATUSES } from '@/types'

interface Props {
  user: User | null
  orders: OrderWithItems[]
  wishlistItems: (Wishlist & { products: Product | null })[]
  loyaltyHistory: LoyaltyPoint[]
  loyaltyBalance: number
}

type Tab = 'orders' | 'wishlist' | 'loyalty' | 'profile'

export default function AccountClient({ user, orders, wishlistItems, loyaltyHistory, loyaltyBalance }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [localWishlist, setLocalWishlist] = useState(wishlistItems)

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileSaving(true)
    const fd = new FormData(e.currentTarget)
    const result = await updateProfile(fd)
    setProfileMessage(result.success ? 'Profili u ruajt!' : (result.error ?? 'Gabim.'))
    setProfileSaving(false)
    setTimeout(() => setProfileMessage(''), 3000)
  }

  const handleRemoveWishlist = async (id: string) => {
    setLocalWishlist((prev) => prev.filter((w) => w.id !== id))
    await removeFromWishlist(id)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'orders', label: 'POROSITË MIA' },
    { key: 'wishlist', label: 'WISHLIST' },
    { key: 'loyalty', label: 'PIKËT E MIA' },
    { key: 'profile', label: 'PROFILI' },
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ background: 'var(--black)', padding: '32px 40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--white)', overflow: 'hidden', flexShrink: 0 }}>
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={user.name} width={60} height={60} className="object-cover" />
            ) : getInitials(user?.name ?? 'U')}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--white)' }}>
              {user?.name?.toUpperCase()}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{user?.email}</p>
            {loyaltyBalance > 0 && (
              <p style={{ fontSize: 11, color: '#C9A84C', marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                ★ {loyaltyBalance} PIKË = {formatPrice(loyaltyPointsToEuros(loyaltyBalance))}
              </p>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px',
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === tab.key ? 'var(--white)' : 'rgba(255,255,255,0.5)',
                borderBottom: activeTab === tab.key ? '2px solid var(--white)' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-inner">
        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 20 }}>
              POROSITË MIA ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: 'var(--gray-dark)', marginBottom: 16 }}>Nuk keni bërë ende asnjë porosi.</p>
                <Link href="/stores" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px', width: 'auto' }}>
                  EKSPLORONI DYQANET
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} style={{ display: 'block', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>#{generateOrderNumber(order.id)}</p>
                        <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{formatDate(order.created_at)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`status-badge status-${order.status}`}>
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label}
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900 }}>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {order.order_items.slice(0, 4).map((item) => (
                        <div key={item.id} style={{ width: 44, height: 44, borderRadius: 6, background: '#252525', position: 'relative', overflow: 'hidden' }}>
                          {item.products?.images?.[0] && <Image src={item.products.images[0]} alt="" fill className="object-cover" sizes="44px" />}
                        </div>
                      ))}
                      {order.order_items.length > 4 && (
                        <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--gray-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--gray-dark)', fontWeight: 700 }}>
                          +{order.order_items.length - 4}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 20 }}>
              LISTA E DËSHIRAVE ({localWishlist.length})
            </h2>
            {localWishlist.length === 0 ? (
              <p style={{ color: 'var(--gray-dark)', textAlign: 'center', padding: '40px 0' }}>Lista juaj e dëshirave është bosh.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {localWishlist.map((item) => {
                  const product = item.products
                  if (!product) return null
                  return (
                    <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <Link href={`/products/${product.slug}`} style={{ display: 'block' }}>
                        <div style={{ aspectRatio: '1', background: '#252525', position: 'relative' }}>
                          {product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="220px" />
                          ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>IMG</div>
                          )}
                        </div>
                      </Link>
                      <div style={{ padding: '10px 12px' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{product.name}</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{formatPrice(product.price)}</p>
                        <button
                          onClick={() => handleRemoveWishlist(item.id)}
                          style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
                        >
                          HIQE
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* LOYALTY */}
        {activeTab === 'loyalty' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 20 }}>PIKËT E BESNIKËRISË</h2>
            <div style={{ background: 'var(--black)', borderRadius: 12, padding: '24px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>BALANCA AKTUALE</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, color: '#C9A84C' }}>{loyaltyBalance}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>= {formatPrice(loyaltyPointsToEuros(loyaltyBalance))}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  1 pikë = €0.01<br />
                  Fitoni 1 pikë për çdo €1 të shpenzuar
                </p>
              </div>
            </div>
            {loyaltyHistory.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gray-dark)', marginBottom: 16 }}>HISTORIA</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {loyaltyHistory.map((entry) => (
                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-light)' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{entry.reason}</p>
                        <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{formatDate(entry.created_at)}</p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: entry.points > 0 ? '#16a34a' : '#dc2626' }}>
                        {entry.points > 0 ? '+' : ''}{entry.points} pikë
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 24 }}>PROFILI IM</h2>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Emri i plotë</label>
                <input id="name" name="name" type="text" className="form-input" defaultValue={user?.name} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Numri i telefonit</label>
                <input id="phone" name="phone" type="tel" className="form-input" defaultValue={user?.phone ?? ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
              </div>
              {profileMessage && (
                <p style={{ fontSize: 13, color: profileMessage.includes('Gabim') ? '#dc2626' : '#16a34a', marginBottom: 12 }}>
                  {profileMessage}
                </p>
              )}
              <button type="submit" className="btn-primary" disabled={profileSaving}>
                {profileSaving ? 'DUKE RUAJTUR…' : 'RUAJ NDRYSHIMET'}
              </button>
            </form>

            {user?.referral_code && (
              <div style={{ marginTop: 32, padding: '20px 24px', background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 8 }}>KODI JUAJ I REFERIMIT</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.2em' }}>{user.referral_code}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginTop: 6 }}>Ndajeni me miqtë tuaj dhe fitoni bonus!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
