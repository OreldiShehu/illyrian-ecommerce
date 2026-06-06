'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { assignFeaturedSlot, removeFeaturedSlot } from '@/app/actions/admin'
import { formatPrice } from '@/lib/utils'

interface FeaturedRow {
  id: string
  slot_position: number
  product_id: string | null
  vendor_id: string | null
  starts_at: string
  ends_at: string | null
  is_active: boolean
  products?: { id: string; name: string; slug: string; images: string[]; price: number } | null
  vendors?: { id: string; store_name: string; slug: string } | null
}

interface ProductOption {
  id: string
  name: string
  price: number
  images: string[]
  vendors?: { store_name: string } | null
}

const TOTAL_SLOTS = 6

export default function AdminFeaturedPage() {
  const supabase = createClient()
  const [featured, setFeatured] = useState<FeaturedRow[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningSlot, setAssigningSlot] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      const [featuredResult, productsResult] = await Promise.all([
        supabase.from('featured_slots').select('*, products(id, name, slug, images, price), vendors(id, store_name, slug)').eq('is_active', true).order('slot_position'),
        supabase.from('products').select('id, name, price, images, vendors(store_name)').eq('is_active', true).order('name').limit(100),
      ])
      setFeatured((featuredResult.data ?? []) as FeaturedRow[])
      setProducts((productsResult.data ?? []) as ProductOption[])
      setLoading(false)
    }
    load()
  }, [])

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleAssign = async (slot: number) => {
    if (!selectedProduct) return
    setActionPending(`assign_${slot}`)
    const fd = new FormData()
    fd.append('slot_position', slot.toString())
    fd.append('product_id', selectedProduct)
    if (endsAt) fd.append('ends_at', new Date(endsAt).toISOString())
    const result = await assignFeaturedSlot(fd)
    if (result.success) {
      const { data } = await supabase.from('featured_slots').select('*, products(id, name, slug, images, price), vendors(id, store_name, slug)').eq('is_active', true).order('slot_position')
      setFeatured((data ?? []) as FeaturedRow[])
      setAssigningSlot(null)
      setSelectedProduct('')
      setEndsAt('')
      flash('Sloti u përditësua!')
    }
    setActionPending(null)
  }

  const handleRemove = async (slotId: string) => {
    setActionPending(`remove_${slotId}`)
    const fd = new FormData()
    fd.append('slot_id', slotId)
    const result = await removeFeaturedSlot(fd)
    if (result.success) {
      setFeatured((prev) => prev.filter((f) => f.id !== slotId))
      flash('Sloti u zbraz.')
    }
    setActionPending(null)
  }

  if (loading) {
    return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200, borderRadius: 10 }} /></div>
  }

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1)

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>MENAXHIMI</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>PRODUKTET TË VEÇUARA</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginTop: 6 }}>Menaxhoni {TOTAL_SLOTS} slotet e produkteve të veçuara në faqen kryesore.</p>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
          ✓ {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {slots.map((slot) => {
          const entry = featured.find((f) => f.slot_position === slot)
          const isAssigning = assigningSlot === slot
          const isPending = !!actionPending

          return (
            <div key={slot} style={{ background: 'var(--white)', border: `2px solid ${entry ? 'var(--black)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden' }}>
              {/* Slot header */}
              <div style={{ padding: '12px 16px', background: entry ? 'var(--black)' : 'var(--off-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: entry ? 'var(--white)' : 'var(--gray-mid)' }}>
                  SLOT #{slot}
                </p>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: entry ? '#C9A84C' : 'var(--gray-light)', color: entry ? 'var(--black)' : 'var(--gray-mid)', fontWeight: 700 }}>
                  {entry ? 'AKTIV' : 'BOSH'}
                </span>
              </div>

              <div style={{ padding: 16 }}>
                {entry?.products ? (
                  <div>
                    <div style={{ aspectRatio: '4/3', borderRadius: 8, background: '#252525', position: 'relative', overflow: 'hidden', marginBottom: 12 }}>
                      {entry.products.images?.[0] && (
                        <Image src={entry.products.images[0]} alt="" fill className="object-cover" sizes="280px" />
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{entry.products.name}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{formatPrice(entry.products.price)}</p>
                    {entry.vendors && <p style={{ fontSize: 11, color: 'var(--gray-dark)', marginBottom: 12 }}>{entry.vendors.store_name}</p>}
                    <button
                      onClick={() => handleRemove(entry.id)}
                      disabled={isPending}
                      style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', width: '100%', opacity: isPending ? 0.6 : 1 }}
                    >
                      ZBRAZ SLOTIN
                    </button>
                  </div>
                ) : isAssigning ? (
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>ZGJIDHNI PRODUKTIN</p>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="form-select"
                      style={{ marginBottom: 12, fontSize: 12 }}
                    >
                      <option value="">— Zgjidhni produktin —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({(p.vendors as any)?.store_name}) — {formatPrice(p.price)}
                        </option>
                      ))}
                    </select>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11 }}>Skadon (opsional)</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={endsAt}
                        onChange={(e) => setEndsAt(e.target.value)}
                        style={{ fontSize: 12 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleAssign(slot)} disabled={!selectedProduct || isPending} style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, background: 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 4, padding: '8px 0', cursor: 'pointer', opacity: (!selectedProduct || isPending) ? 0.6 : 1 }}>
                        {isPending ? '…' : 'CAKTO'}
                      </button>
                      <button onClick={() => { setAssigningSlot(null); setSelectedProduct(''); setEndsAt('') }} style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 14px', cursor: 'pointer' }}>
                        ANULO
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ fontSize: 12, color: 'var(--gray-mid)', marginBottom: 16 }}>Sloti është bosh</p>
                    <button onClick={() => { setAssigningSlot(slot); setSelectedProduct(''); setEndsAt('') }} className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }}>
                      + SHTO PRODUKT
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
