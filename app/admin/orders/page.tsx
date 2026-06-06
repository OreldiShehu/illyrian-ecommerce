'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'
import { ORDER_STATUSES } from '@/types'
import Papa from 'papaparse'

interface OrderRow {
  id: string
  status: string
  total: number
  created_at: string
  shipping_name: string
  shipping_city: string
  shipping_phone: string
  shipping_address: string
  coupon_code: string | null
  coupon_discount: number
  vendors?: { store_name: string } | null
}

const PAGE_SIZE = 20

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('orders')
        .select('id, status, total, created_at, shipping_name, shipping_city, shipping_phone, shipping_address, coupon_code, coupon_discount, vendors(store_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      if (search) query = query.ilike('shipping_name', `%${search}%`)

      const { data, count } = await query
      setOrders((data ?? []) as OrderRow[])
      setTotal(count ?? 0)
      setLoading(false)
    }
    load()
  }, [statusFilter, page, search])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(0)
  }

  const exportCSV = () => {
    const rows = orders.map((o) => ({
      id: generateOrderNumber(o.id),
      status: o.status,
      total: o.total,
      customer: o.shipping_name,
      city: o.shipping_city,
      phone: o.shipping_phone,
      address: o.shipping_address,
      vendor: (o.vendors as any)?.store_name ?? '',
      coupon: o.coupon_code ?? '',
      coupon_discount: o.coupon_discount,
      date: formatDate(o.created_at),
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>MENAXHIMI</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>POROSITË ({total})</h1>
        </div>
        <button onClick={exportCSV} className="btn-secondary" style={{ width: 'auto', padding: '10px 20px' }}>
          ↓ EKSPORTO CSV
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', flex: 1, gap: 0, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Kërko sipas emrit të klientit…"
            style={{ flex: 1, padding: '10px 16px', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'var(--font-body)' }}
          />
          <button onClick={handleSearch} style={{ padding: '10px 20px', background: 'var(--black)', color: 'var(--white)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>KËRKO</button>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0) }}
            style={{
              padding: '10px 16px',
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: statusFilter === s ? 'var(--black)' : 'var(--gray-mid)',
              borderBottom: statusFilter === s ? '2px solid var(--black)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {s === 'all' ? 'TË GJITHA' : ORDER_STATUSES[s as keyof typeof ORDER_STATUSES]?.label?.toUpperCase() ?? s.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 4, marginBottom: 8 }} />)}
          </div>
        ) : orders.length === 0 ? (
          <p style={{ padding: '32px 20px', fontSize: 13, color: 'var(--gray-dark)', textAlign: 'center' }}>Nuk ka porosi.</p>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>POROSIA</th>
                <th>KLIENTI</th>
                <th>QYTETI</th>
                <th>SHITËSI</th>
                <th>DATA</th>
                <th>TOTALI</th>
                <th>STATUSI</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>#{generateOrderNumber(order.id)}</td>
                  <td>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{order.shipping_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{order.shipping_phone}</p>
                  </td>
                  <td style={{ fontSize: 12 }}>{order.shipping_city}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-dark)' }}>{(order.vendors as any)?.store_name ?? '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{formatDate(order.created_at)}</td>
                  <td>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>{formatPrice(order.total)}</p>
                    {order.coupon_code && (
                      <p style={{ fontSize: 10, color: '#16a34a' }}>-{formatPrice(order.coupon_discount)}</p>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status}`} style={{ fontSize: 10 }}>
                      {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary" style={{ width: 'auto', padding: '8px 16px' }}>←</button>
          <span style={{ padding: '8px 16px', fontSize: 13 }}>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary" style={{ width: 'auto', padding: '8px 16px' }}>→</button>
        </div>
      )}
    </div>
  )
}
