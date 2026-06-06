'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { markCommissionReceived, sendCommissionReminderEmail } from '@/app/actions/admin'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'

interface LedgerRow {
  id: string
  order_id: string
  vendor_id: string
  amount_owed: number
  status: 'pending' | 'paid' | 'received' | 'overdue'
  due_date: string
  created_at: string
  vendors?: { store_name: string; commission_rate: number } | null
  orders?: { shipping_name: string; total: number } | null
}

export default function AdminCommissionsPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'received' | 'overdue'>('pending')
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('commission_ledger')
        .select('*, vendors(store_name, commission_rate), orders(shipping_name, total)')
        .order('due_date', { ascending: true })
      setEntries((data ?? []) as LedgerRow[])
      setLoading(false)
    }
    load()
  }, [])

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleMarkReceived = async (entryId: string) => {
    setActionPending(entryId)
    const fd = new FormData()
    fd.append('ledger_id', entryId)
    const result = await markCommissionReceived(fd)
    if (result.success) {
      setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, status: 'received' } : e))
      flash('Komisioni u konfirmua si i marrë!')
    }
    setActionPending(null)
  }

  const handleReminder = async (vendorId: string, amount: number) => {
    setActionPending(`remind_${vendorId}`)
    const fd = new FormData()
    fd.append('vendor_id', vendorId)
    fd.append('amount', amount.toString())
    const result = await sendCommissionReminderEmail(fd)
    if (result.success) flash('Email-i kujtues u dërgua!')
    setActionPending(null)
  }

  const now = new Date()

  const grouped: Record<string, { vendor_name: string; vendor_id: string; entries: LedgerRow[]; pending: number; overdue: number }> = {}
  entries.forEach((e) => {
    const vId = e.vendor_id
    if (!grouped[vId]) {
      grouped[vId] = { vendor_name: e.vendors?.store_name ?? 'I panjohur', vendor_id: vId, entries: [], pending: 0, overdue: 0 }
    }
    grouped[vId].entries.push(e)
    if (e.status === 'pending' || e.status === 'paid') {
      if (new Date(e.due_date) < now && e.status !== 'received') {
        grouped[vId].overdue += e.amount
      } else if (e.status === 'pending') {
        grouped[vId].pending += e.amount
      }
    }
  })

  const allEntries = entries
  const filteredEntries = filter === 'all'
    ? allEntries
    : filter === 'overdue'
      ? allEntries.filter((e) => (e.status === 'pending' || e.status === 'paid') && new Date(e.due_date) < now)
      : allEntries.filter((e) => e.status === filter)

  const stats = {
    totalPending: allEntries.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount_owed, 0),
    totalReceived: allEntries.filter((e) => e.status === 'received').reduce((s, e) => s + e.amount_owed, 0),
    overdueCount: allEntries.filter((e) => e.status === 'pending' && new Date(e.due_date) < now).length,
  }

  if (loading) {
    return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200, borderRadius: 10 }} /></div>
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>FINANCAT</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>KOMISIONET</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'NË PRITJE', value: formatPrice(stats.totalPending), sub: `${stats.overdueCount} të vonuara`, alert: stats.overdueCount > 0 },
          { label: 'TË MARRA', value: formatPrice(stats.totalReceived), sub: 'histori totale', alert: false },
          { label: 'SHITËS ME BORXH', value: Object.values(grouped).filter((g) => g.overdue > 0).length.toString(), sub: 'dërgoni kujtesë', alert: false },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ background: s.alert ? '#fef2f2' : 'var(--white)', borderColor: s.alert ? '#fca5a5' : 'var(--border)' }}>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.alert ? '#dc2626' : undefined }}>{s.value}</p>
            <p style={{ fontSize: 11, color: s.alert ? '#dc2626' : 'var(--gray-dark)', marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {(['pending', 'overdue', 'paid', 'received', 'all'] as const).map((f) => {
          const count = f === 'all' ? allEntries.length
            : f === 'overdue' ? allEntries.filter((e) => (e.status === 'pending' || e.status === 'paid') && new Date(e.due_date) < now).length
            : allEntries.filter((e) => e.status === f).length
          const label = { all: 'TË GJITHA', pending: 'NË PRITJE', overdue: 'TË VONUARA', paid: 'NGA SHITËSI', received: 'TË KONFIRMUARA' }[f]
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 16px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', background: 'none', border: 'none', cursor: 'pointer', color: filter === f ? 'var(--black)' : 'var(--gray-mid)', borderBottom: filter === f ? '2px solid var(--black)' : '2px solid transparent', marginBottom: -1 }}>
              {label} ({count})
            </button>
          )
        })}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {filteredEntries.length === 0 ? (
          <p style={{ padding: '32px 20px', fontSize: 13, color: 'var(--gray-dark)', textAlign: 'center' }}>Nuk ka komisione.</p>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>SHITËSI</th>
                <th>POROSIA</th>
                <th>KLIENTI</th>
                <th>SHUMA</th>
                <th>AFATI</th>
                <th>STATUSI</th>
                <th>VEPRIMET</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const isOverdue = (entry.status === 'pending' || entry.status === 'paid') && new Date(entry.due_date) < now
                const isPendingAction = actionPending === entry.id
                return (
                  <tr key={entry.id} style={{ background: isOverdue ? '#fff5f5' : undefined }}>
                    <td style={{ fontSize: 13, fontWeight: 700 }}>{entry.vendors?.store_name ?? '—'}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>#{generateOrderNumber(entry.order_id)}</td>
                    <td style={{ fontSize: 12 }}>{entry.orders?.shipping_name ?? '—'}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{formatPrice(entry.amount_owed)}</td>
                    <td>
                      <span style={{ fontSize: 12, color: isOverdue ? '#dc2626' : 'var(--gray-dark)', fontWeight: isOverdue ? 700 : 400 }}>
                        {formatDate(entry.due_date)}{isOverdue ? ' ⚠' : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: entry.status === 'received' ? '#f0fdf4' : isOverdue ? '#fef2f2' : entry.status === 'paid' ? '#eff6ff' : '#fffbeb', color: entry.status === 'received' ? '#16a34a' : isOverdue ? '#dc2626' : entry.status === 'paid' ? '#2563eb' : '#d97706' }}>
                        {entry.status === 'received' ? 'KONFIRMUAR' : entry.status === 'paid' ? 'NGA SHITËSI' : isOverdue ? 'I VONUAR' : 'NË PRITJE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {entry.status === 'paid' && (
                          <button onClick={() => handleMarkReceived(entry.id)} disabled={isPendingAction} style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, background: '#111', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', opacity: isPendingAction ? 0.6 : 1 }}>
                            KONFIRMO
                          </button>
                        )}
                        {(entry.status === 'pending' || isOverdue) && (
                          <button onClick={() => handleReminder(entry.vendor_id, entry.amount)} disabled={actionPending === `remind_${entry.vendor_id}`} style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', opacity: actionPending === `remind_${entry.vendor_id}` ? 0.6 : 1 }}>
                            KUJTO
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
