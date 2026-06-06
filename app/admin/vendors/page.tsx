'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { approveVendor, rejectVendor, toggleVendorActive, updateCommissionRate } from '@/app/actions/admin'
import { formatDate } from '@/lib/utils'

interface VendorRow {
  id: string
  store_name: string
  slug: string
  city: string
  category: string
  status: string
  is_active: boolean
  commission_rate: number
  plan: string
  created_at: string
  users?: { email: string; name: string } | null
}

export default function AdminVendorsPage() {
  const supabase = createClient()
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending')
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [editingRate, setEditingRate] = useState<{ id: string; rate: string } | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('vendors')
        .select('*, users(email, name)')
        .order('created_at', { ascending: false })
      setVendors((data ?? []) as VendorRow[])
      setLoading(false)
    }
    load()
  }, [])

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const handleApprove = async (vendorId: string) => {
    setActionPending(vendorId)
    const fd = new FormData()
    fd.append('vendor_id', vendorId)
    const result = await approveVendor(fd)
    if (result.success) {
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, status: 'active', is_active: true } : v))
      flash('Shitësi u aprovua!')
    }
    setActionPending(null)
  }

  const handleReject = async (vendorId: string) => {
    if (!confirm('Jeni i sigurt që dëshironi ta refuzoni këtë aplikim?')) return
    setActionPending(vendorId)
    const fd = new FormData()
    fd.append('vendor_id', vendorId)
    const result = await rejectVendor(fd)
    if (result.success) {
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, status: 'rejected' } : v))
      flash('Shitësi u refuzua.')
    }
    setActionPending(null)
  }

  const handleToggle = async (vendorId: string, currentActive: boolean) => {
    setActionPending(`toggle_${vendorId}`)
    const fd = new FormData()
    fd.append('vendor_id', vendorId)
    fd.append('is_active', (!currentActive).toString())
    const result = await toggleVendorActive(fd)
    if (result.success) {
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, is_active: !currentActive } : v))
      flash(`Dyqani ${!currentActive ? 'u aktivizua' : 'u çaktivizua'}.`)
    }
    setActionPending(null)
  }

  const handleRateSave = async (vendorId: string) => {
    if (!editingRate) return
    const rate = parseFloat(editingRate.rate)
    if (isNaN(rate) || rate < 0 || rate > 50) return
    setActionPending(`rate_${vendorId}`)
    const fd = new FormData()
    fd.append('vendor_id', vendorId)
    fd.append('commission_rate', rate.toString())
    const result = await updateCommissionRate(fd)
    if (result.success) {
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, commission_rate: rate } : v))
      setEditingRate(null)
      flash('Norma u përditësua!')
    }
    setActionPending(null)
  }

  const filtered = filter === 'all' ? vendors : vendors.filter((v) => v.status === filter)

  const counts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === 'pending').length,
    active: vendors.filter((v) => v.status === 'active').length,
    rejected: vendors.filter((v) => v.status === 'rejected').length,
  }

  if (loading) {
    return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200, borderRadius: 10 }} /></div>
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>MENAXHIMI</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>SHITËSIT ({vendors.length})</h1>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {(['pending', 'active', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 18px',
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: filter === f ? 'var(--black)' : 'var(--gray-mid)',
              borderBottom: filter === f ? '2px solid var(--black)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {f === 'all' ? 'TË GJITHË' : f === 'pending' ? 'NË PRITJE' : f === 'active' ? 'AKTIVË' : 'REFUZUAR'} ({counts[f]})
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '32px 20px', fontSize: 13, color: 'var(--gray-dark)', textAlign: 'center' }}>Nuk ka shitës.</p>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>DYQANI</th>
                <th>EMAIL</th>
                <th>QYTETI</th>
                <th>PLANI</th>
                <th>KOMISIONI</th>
                <th>STATUSI</th>
                <th>DATA</th>
                <th style={{ width: 200 }}>VEPRIMET</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vendor) => {
                const isPending = actionPending === vendor.id || actionPending === `toggle_${vendor.id}` || actionPending === `rate_${vendor.id}`
                return (
                  <tr key={vendor.id}>
                    <td>
                      <p style={{ fontSize: 13, fontWeight: 700 }}>{vendor.store_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{vendor.category}</p>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-dark)' }}>{vendor.users?.email ?? '—'}</td>
                    <td style={{ fontSize: 12 }}>{vendor.city}</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: vendor.plan === 'pro' ? '#111' : '#f4f4f4',
                        color: vendor.plan === 'pro' ? '#C9A84C' : 'var(--gray-dark)',
                      }}>
                        {(vendor.plan ?? 'free').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {editingRate?.id === vendor.id ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            value={editingRate.rate}
                            onChange={(e) => setEditingRate({ id: vendor.id, rate: e.target.value })}
                            style={{ width: 56, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }}
                          />
                          <button onClick={() => handleRateSave(vendor.id)} disabled={isPending} style={{ fontSize: 10, background: '#111', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>OK</button>
                          <button onClick={() => setEditingRate(null)} style={{ fontSize: 10, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>×</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingRate({ id: vendor.id, rate: vendor.commission_rate?.toString() ?? '12' })}
                          style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                        >
                          {vendor.commission_rate ?? 12}%
                        </button>
                      )}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: vendor.status === 'active' && vendor.is_active ? '#f0fdf4' : vendor.status === 'pending' ? '#fffbeb' : '#fef2f2',
                        color: vendor.status === 'active' && vendor.is_active ? '#16a34a' : vendor.status === 'pending' ? '#d97706' : '#dc2626',
                      }}>
                        {vendor.status === 'pending' ? 'NË PRITJE' : vendor.status === 'active' ? (vendor.is_active ? 'AKTIV' : 'ÇAKTIVIZUAR') : 'REFUZUAR'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{formatDate(vendor.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {vendor.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(vendor.id)} disabled={isPending} style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>APROVO</button>
                            <button onClick={() => handleReject(vendor.id)} disabled={isPending} style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>REFUZO</button>
                          </>
                        )}
                        {vendor.status === 'active' && (
                          <button onClick={() => handleToggle(vendor.id, vendor.is_active)} disabled={isPending} style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, background: vendor.is_active ? '#f4f4f4' : '#111', color: vendor.is_active ? '#111' : '#fff', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
                            {vendor.is_active ? 'ÇAKTIVIZO' : 'AKTIVIZO'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
