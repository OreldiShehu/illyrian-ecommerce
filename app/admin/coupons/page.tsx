'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createCoupon, toggleCoupon, deleteCoupon } from '@/app/actions/admin'
import { formatPrice, formatDate } from '@/lib/utils'

interface CouponRow {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order: number | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

interface CouponForm {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  min_order: string
  max_uses: string
  expires_at: string
}

const EMPTY_FORM: CouponForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order: '',
  max_uses: '',
  expires_at: '',
}

export default function AdminCouponsPage() {
  const supabase = createClient()
  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      setCoupons((data ?? []) as CouponRow[])
      setLoading(false)
    }
    load()
  }, [])

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    const fd = new FormData()
    fd.append('code', form.code.toUpperCase().trim())
    fd.append('discount_type', form.discount_type)
    fd.append('discount_value', form.discount_value)
    if (form.min_order) fd.append('min_order', form.min_order)
    if (form.max_uses) fd.append('max_uses', form.max_uses)
    if (form.expires_at) fd.append('expires_at', new Date(form.expires_at).toISOString())
    const result = await createCoupon(fd)
    if (result.success) {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      setCoupons((data ?? []) as CouponRow[])
      setShowForm(false)
      setForm(EMPTY_FORM)
      flash('Kuponi u krijua!')
    } else {
      setFormError(result.error ?? 'Gabim.')
    }
    setSubmitting(false)
  }

  const handleToggle = async (couponId: string, currentActive: boolean) => {
    setActionPending(`toggle_${couponId}`)
    const fd = new FormData()
    fd.append('coupon_id', couponId)
    fd.append('is_active', (!currentActive).toString())
    const result = await toggleCoupon(fd)
    if (result.success) {
      setCoupons((prev) => prev.map((c) => c.id === couponId ? { ...c, is_active: !currentActive } : c))
      flash(`Kuponi ${!currentActive ? 'u aktivizua' : 'u çaktivizua'}.`)
    }
    setActionPending(null)
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Jeni i sigurt?')) return
    setActionPending(`delete_${couponId}`)
    const fd = new FormData()
    fd.append('coupon_id', couponId)
    const result = await deleteCoupon(fd)
    if (result.success) {
      setCoupons((prev) => prev.filter((c) => c.id !== couponId))
      flash('Kuponi u fshi.')
    }
    setActionPending(null)
  }

  if (loading) {
    return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200, borderRadius: 10 }} /></div>
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>MENAXHIMI</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>KUPONAT ({coupons.length})</h1>
        </div>
        <button onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setFormError('') }} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
          + KUPON I RI
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
          ✓ {successMsg}
        </div>
      )}

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {coupons.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--gray-dark)', marginBottom: 16 }}>Nuk ka kupon të krijuar ende.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>KRIJO KUPONIN E PARË</button>
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>KODI</th>
                <th>ZBRITJA</th>
                <th>MIN. POROSIA</th>
                <th>PËRDORIMET</th>
                <th>SKADON</th>
                <th>STATUSI</th>
                <th style={{ width: 160 }}>VEPRIMET</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const isPending = !!actionPending
                const isExpired = c.expires_at && new Date(c.expires_at) < new Date()
                const isExhausted = c.max_uses !== null && c.uses_count >= c.max_uses
                return (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, letterSpacing: '0.12em' }}>{c.code}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                    </td>
                    <td style={{ fontSize: 12 }}>{c.min_order ? formatPrice(c.min_order) : '—'}</td>
                    <td style={{ fontSize: 12 }}>
                      {c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''} herë
                    </td>
                    <td style={{ fontSize: 12, color: isExpired ? '#dc2626' : 'var(--gray-dark)' }}>
                      {c.expires_at ? formatDate(c.expires_at) : '—'}
                      {isExpired && ' (skaduar)'}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: (c.is_active && !isExpired && !isExhausted) ? '#f0fdf4' : '#fef2f2',
                        color: (c.is_active && !isExpired && !isExhausted) ? '#16a34a' : '#dc2626',
                      }}>
                        {isExpired ? 'SKADUAR' : isExhausted ? 'I EZAURUAR' : c.is_active ? 'AKTIV' : 'ÇAKTIV'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleToggle(c.id, c.is_active)}
                          disabled={isPending}
                          style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, background: c.is_active ? '#f4f4f4' : '#111', color: c.is_active ? '#111' : '#fff', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}
                        >
                          {c.is_active ? 'ÇAKTIVO' : 'AKTIVO'}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={isPending}
                          style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}
                        >
                          FSHI
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create coupon modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 12, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, letterSpacing: '0.08em' }}>KRIJO KUPON</h2>
              <button onClick={() => setShowForm(false)} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-mid)' }}>×</button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Kodi *</label>
                <input type="text" className="form-input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" required style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Lloji i zbritjes</label>
                  <select className="form-select" value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percentage' | 'fixed' }))}>
                    <option value="percentage">Përqindje (%)</option>
                    <option value="fixed">Shumë fikse (€)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vlera *</label>
                  <input type="number" step="0.01" min="0" className="form-input" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Porosia minimale (€)</label>
                  <input type="number" step="0.01" min="0" className="form-input" value={form.min_order} onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Përdorime max.</label>
                  <input type="number" min="1" className="form-input" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Data e skadimit</label>
                <input type="datetime-local" className="form-input" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
              </div>
              {formError && <p className="form-error" style={{ marginBottom: 12 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ width: 'auto', padding: '10px 24px' }}>ANULO</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                  {submitting ? 'DUKE KRIJUAR…' : 'KRIJO KUPONIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
