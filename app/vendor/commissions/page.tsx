'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { markCommissionPaid } from '@/app/actions/vendor'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'

interface CommissionEntry {
  id: string
  order_id: string
  amount_owed: number
  status: 'pending' | 'paid' | 'received' | 'overdue'
  due_date: string
  created_at: string
  orders?: {
    id: string
    total: number
    shipping_name: string
  } | null
}

export default function VendorCommissionsPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<CommissionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState('')
  const [commissionRate, setCommissionRate] = useState(12)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: v } = await supabase.from('vendors').select('id, commission_rate').eq('user_id', user.id).single()
      if (!v) return
      setVendorId(v.id)
      setCommissionRate(v.commission_rate ?? 12)
      const { data } = await supabase
        .from('commission_ledger')
        .select('*, orders(id, total, shipping_name)')
        .eq('vendor_id', v.id)
        .order('created_at', { ascending: false })
      setEntries((data ?? []) as CommissionEntry[])
      setLoading(false)
    }
    load()
  }, [])

  const handleMarkPaid = async (entryId: string) => {
    setSubmitting(entryId)
    const fd = new FormData()
    fd.append('ledger_id', entryId)
    const result = await markCommissionPaid(fd)
    if (result.success) {
      setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, status: 'paid' } : e))
      setSuccessMsg('Pagesa u regjistrua! Adminët janë njoftuar.')
      setTimeout(() => setSuccessMsg(''), 4000)
    }
    setSubmitting(null)
  }

  const now = new Date()
  const filtered = filter === 'all' ? entries : entries.filter((e) => e.status === filter)

  const totalPending = entries.filter((e) => e.status === 'pending' || e.status === 'overdue').reduce((s, e) => s + e.amount_owed, 0)
  const totalPaid = entries.filter((e) => e.status === 'paid' || e.status === 'received').reduce((s, e) => s + e.amount_owed, 0)
  const overdueCount = entries.filter((e) => e.status === 'overdue' || (e.status === 'pending' && new Date(e.due_date) < now)).length

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 24, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>FINANCAT</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>KOMISIONET</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ background: overdueCount > 0 ? '#fef2f2' : 'var(--white)', borderColor: overdueCount > 0 ? '#fca5a5' : 'var(--border)' }}>
          <p className="stat-label">KOMISIONE NË PRITJE</p>
          <p className="stat-value" style={{ color: overdueCount > 0 ? '#dc2626' : undefined }}>{formatPrice(totalPending)}</p>
          <p style={{ fontSize: 11, color: overdueCount > 0 ? '#dc2626' : 'var(--gray-dark)', marginTop: 4 }}>
            {overdueCount > 0 ? `${overdueCount} të vonuara!` : 'Brenda afatit'}
          </p>
        </div>
        <div className="stat-card" style={{ background: 'var(--white)' }}>
          <p className="stat-label">KOMISIONE TË PAGUARA</p>
          <p className="stat-value">{formatPrice(totalPaid)}</p>
          <p style={{ fontSize: 11, color: 'var(--gray-dark)', marginTop: 4 }}>gjithsej historik</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--white)' }}>
          <p className="stat-label">NORMA E KOMISIONIT</p>
          <p className="stat-value">{commissionRate}%</p>
          <p style={{ fontSize: 11, color: 'var(--gray-dark)', marginTop: 4 }}>nga çdo shitje COD</p>
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
        <strong>Si funksionon:</strong> Pas çdo dërgese, keni 14 ditë t&apos;i paguani komisionin platformës. Klikoni &ldquo;KAM PAGUAR&rdquo; pasi të bëni transfertën bankare.
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {(['all', 'pending', 'overdue', 'paid'] as const).map((f) => {
          const count = f === 'all' ? entries.length : entries.filter((e) => e.status === f).length
          const label = f === 'all' ? 'TË GJITHA' : f === 'pending' ? 'NË PRITJE' : f === 'overdue' ? 'TË VONUARA' : 'TË PAGUARA'
          return (
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
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '32px 20px', fontSize: 13, color: 'var(--gray-dark)', textAlign: 'center' }}>Nuk ka komisione.</p>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>POROSIA</th>
                <th>KLIENTI</th>
                <th>DATA E DORËZIMIT</th>
                <th>AFATI</th>
                <th>SHUMA</th>
                <th>STATUSI</th>
                <th>VEPRIMI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const isOverdue = entry.status !== 'paid' && new Date(entry.due_date) < now
                return (
                  <tr key={entry.id} style={{ background: isOverdue ? '#fff5f5' : undefined }}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>
                        #{generateOrderNumber(entry.order_id)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{entry.orders?.shipping_name ?? '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{formatDate(entry.created_at)}</td>
                    <td>
                      <span style={{ fontSize: 12, color: isOverdue ? '#dc2626' : 'var(--gray-dark)', fontWeight: isOverdue ? 700 : 400 }}>
                        {formatDate(entry.due_date)}
                        {isOverdue && ' ⚠'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{formatPrice(entry.amount_owed)}</span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: entry.status === 'paid' ? '#f0fdf4' : isOverdue ? '#fef2f2' : '#fffbeb',
                        color: entry.status === 'paid' ? '#16a34a' : isOverdue ? '#dc2626' : '#d97706',
                      }}>
                        {entry.status === 'paid' ? 'PAGUAR' : isOverdue ? 'I VONUAR' : 'NË PRITJE'}
                      </span>
                    </td>
                    <td>
                      {entry.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(entry.id)}
                          disabled={submitting === entry.id}
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            background: 'var(--black)',
                            color: 'var(--white)',
                            border: 'none',
                            borderRadius: 4,
                            padding: '5px 12px',
                            cursor: submitting === entry.id ? 'not-allowed' : 'pointer',
                            opacity: submitting === entry.id ? 0.6 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {submitting === entry.id ? '…' : 'KAM PAGUAR'}
                        </button>
                      )}
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
