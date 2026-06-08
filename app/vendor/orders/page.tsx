'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateOrderStatus, markCODCollected } from '@/app/actions/vendor'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'
import { ORDER_STATUSES } from '@/types'
import type { OrderWithItems } from '@/types'

const STATUS_SEQUENCE = ['pending', 'confirmed', 'shipped', 'delivered']

export default function VendorOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: v } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
      if (!v) return
      setVendorId(v.id)
      // Mark all new_order notifications as read
      supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('type', 'new_order').eq('read', false).then(() => {})

      // orders has no vendor_id — get order IDs via order_items
      const { data: vendorItems } = await supabase
        .from('order_items')
        .select('order_id, id, price, quantity, size, color, products(id, name, slug, images)')
        .eq('vendor_id', v.id)

      const orderIds = Array.from(new Set((vendorItems ?? []).map((i) => (i as any).order_id as string)))
      if (!orderIds.length) { setOrders([]); setLoading(false); return }

      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, status, total, created_at, shipping_name, shipping_address, shipping_city, shipping_phone, payment_method, notes')
        .in('id', orderIds)
        .order('created_at', { ascending: false })

      const itemsByOrder = new Map<string, any[]>()
      ;(vendorItems ?? []).forEach((item) => {
        const oid = (item as any).order_id as string
        if (!itemsByOrder.has(oid)) itemsByOrder.set(oid, [])
        itemsByOrder.get(oid)!.push(item)
      })

      const formattedOrders = (ordersData ?? []).map((order) => ({
        ...(order as any),
        order_items: itemsByOrder.get((order as any).id) ?? [],
      }))
      setOrders(formattedOrders as unknown as OrderWithItems[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setActionPending(orderId)
    const fd = new FormData()
    fd.append('order_id', orderId)
    fd.append('status', newStatus)
    const result = await updateOrderStatus(fd)
    if (result.success) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
      setSuccessMsg('Statusi u përditësua!')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
    setActionPending(null)
  }

  const handleCODCollected = async (orderId: string) => {
    setActionPending(`cod_${orderId}`)
    const fd = new FormData()
    fd.append('order_id', orderId)
    const result = await markCODCollected(fd)
    if (result.success) {
      setSuccessMsg('COD u regjistrua! Komisioni u krijua.')
      setTimeout(() => setSuccessMsg(''), 4000)
    }
    setActionPending(null)
  }

  const getNextStatus = (current: string): string | null => {
    const idx = STATUS_SEQUENCE.indexOf(current)
    return idx >= 0 && idx < STATUS_SEQUENCE.length - 1 ? STATUS_SEQUENCE[idx + 1] : null
  }

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Konfirmo',
    confirmed: 'Shëno si Dërguar',
    shipped: 'Shëno si Dorëzuar',
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 8, marginBottom: 12 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>MENAXHIMI</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>POROSITË ({orders.length})</h1>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {['all', ...STATUS_SEQUENCE].map((s) => {
          const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length
          const label = s === 'all' ? 'TË GJITHA' : ORDER_STATUSES[s as keyof typeof ORDER_STATUSES]?.label?.toUpperCase() ?? s.toUpperCase()
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '10px 18px',
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: statusFilter === s ? 'var(--black)' : 'var(--gray-mid)',
                borderBottom: statusFilter === s ? '2px solid var(--black)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '32px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--gray-dark)' }}>Nuk ka porosi {statusFilter !== 'all' ? `me status "${statusFilter}"` : ''}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((order) => {
            const isExpanded = expanded === order.id
            const nextStatus = getNextStatus(order.status)
            const isPending = actionPending === order.id
            return (
              <div key={order.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {/* Row header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>#{generateOrderNumber(order.id)}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 2 }}>{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{order.shipping_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{order.shipping_city}</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{formatPrice(order.total)}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{order.order_items.length} artikuj</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`status-badge status-${order.status}`} style={{ fontSize: 10 }}>
                      {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--gray-mid)', transform: isExpanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>›</span>
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                    {/* Items */}
                    <div style={{ marginBottom: 16 }}>
                      {order.order_items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 6, background: '#252525', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                            {item.products?.images?.[0] && <Image src={item.products.images[0]} alt="" fill className="object-cover" sizes="48px" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>{item.products?.name}</p>
                            {(item.size || item.color) && (
                              <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                            )}
                          </div>
                          <p style={{ fontSize: 13 }}>×{item.quantity}</p>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Address */}
                    <div style={{ padding: '12px 16px', background: 'var(--off-white)', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>Adresa e dorëzimit:</p>
                      <p style={{ color: 'var(--gray-dark)' }}>{order.shipping_address}, {order.shipping_city}</p>
                      <p style={{ color: 'var(--gray-dark)' }}>Tel: {order.shipping_phone}</p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, nextStatus)}
                          disabled={isPending}
                          className="btn-primary"
                          style={{ width: 'auto', padding: '10px 20px', opacity: isPending ? 0.7 : 1 }}
                        >
                          {isPending ? 'DUKE RUAJTUR…' : STATUS_LABELS[order.status] ?? 'PËRDITËSO'}
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleCODCollected(order.id)}
                          disabled={actionPending === `cod_${order.id}`}
                          style={{
                            padding: '10px 20px',
                            fontFamily: 'var(--font-display)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            background: '#C9A84C',
                            color: 'var(--white)',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            opacity: actionPending === `cod_${order.id}` ? 0.7 : 1,
                          }}
                        >
                          CASH U MBLODH
                        </button>
                      )}
                      {order.shipping_phone && (
                        <a
                          href={`https://wa.me/${order.shipping_phone.replace(/\D/g, '')}?text=Pershendetje ${order.shipping_name}, porosia juaj %23${generateOrderNumber(order.id)} eshte ne rruge!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{ textDecoration: 'none', display: 'inline-block', padding: '10px 16px' }}
                        >
                          WHATSAPP
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
