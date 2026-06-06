'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts'

interface RevenuePoint { date: string; revenue: number; orders: number }
interface TopProduct { name: string; revenue: number; qty: number }
interface StatusBreakdown { name: string; value: number; color: string }

export default function VendorAnalyticsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([])
  const [statusData, setStatusData] = useState<StatusBreakdown[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [stats, setStats] = useState({ revenue: 0, orders: 0, avgOrder: 0, conversion: 0 })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: v } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
      if (!v) return

      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const since = new Date()
      since.setDate(since.getDate() - days)

      const { data: orders } = await supabase
        .from('orders')
        .select('id, total, status, created_at, order_items(id, quantity, price, products(id, name))')
        .eq('vendor_id', v.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })

      const allOrders = orders ?? []

      // Revenue by date
      const byDate: Record<string, { revenue: number; orders: number }> = {}
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        byDate[key] = { revenue: 0, orders: 0 }
      }
      allOrders.forEach((o) => {
        const key = o.created_at.slice(0, 10)
        if (byDate[key]) {
          byDate[key].revenue += o.total
          byDate[key].orders += 1
        }
      })
      setRevenueData(Object.entries(byDate).map(([date, v]) => ({ date: date.slice(5), ...v })))

      // Status breakdown
      const statusCounts: Record<string, number> = {}
      allOrders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1 })
      const STATUS_COLORS: Record<string, string> = {
        pending: '#d97706',
        confirmed: '#2563eb',
        shipped: '#7c3aed',
        delivered: '#16a34a',
        cancelled: '#dc2626',
      }
      setStatusData(Object.entries(statusCounts).map(([s, v]) => ({
        name: s.charAt(0).toUpperCase() + s.slice(1),
        value: v,
        color: STATUS_COLORS[s] ?? '#999',
      })))

      // Top products
      const productMap: Record<string, { name: string; revenue: number; qty: number }> = {}
      allOrders.forEach((o) => {
        ;(o.order_items as any[]).forEach((item) => {
          const name = item.products?.name ?? 'I panjohur'
          const id = item.products?.id ?? 'unknown'
          if (!productMap[id]) productMap[id] = { name, revenue: 0, qty: 0 }
          productMap[id].revenue += item.price * item.quantity
          productMap[id].qty += item.quantity
        })
      })
      setTopProducts(
        Object.values(productMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 8)
      )

      // Summary stats
      const completedOrders = allOrders.filter((o) => ['confirmed', 'shipped', 'delivered'].includes(o.status))
      const totalRev = completedOrders.reduce((s, o) => s + o.total, 0)
      setStats({
        revenue: totalRev,
        orders: allOrders.length,
        avgOrder: completedOrders.length > 0 ? totalRev / completedOrders.length : 0,
        conversion: 0,
      })

      setLoading(false)
    }
    load()
  }, [period])

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 24, borderRadius: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 10 }} />)}
        </div>
        <div className="skeleton" style={{ height: 260, borderRadius: 10 }} />
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>RAPORTIMI</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>ANALITIKA</h1>
        </div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '8px 16px',
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                background: period === p ? 'var(--black)' : 'var(--white)',
                color: period === p ? 'var(--white)' : 'var(--gray-dark)',
                border: 'none',
                cursor: 'pointer',
                borderRight: p !== '90d' ? '1px solid var(--border)' : 'none',
              }}
            >
              {p === '7d' ? '7 DITË' : p === '30d' ? '30 DITË' : '90 DITË'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'TË ARDHURAT', value: formatPrice(stats.revenue), sub: 'porosi të konfirmuara' },
          { label: 'POROSITË TOTALE', value: stats.orders.toString(), sub: 'në periudhën e zgjedhur' },
          { label: 'MESATARJA E POROSISË', value: formatPrice(stats.avgOrder), sub: 'për porosi' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ background: 'var(--white)' }}>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--gray-dark)', marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue line chart */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 20 }}>TË ARDHURAT DHE POROSITË</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'var(--font-body)' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `€${v}`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value, name) => name === 'revenue' ? [`€${Number(value).toFixed(2)}`, 'Të ardhura'] : [value, 'Porosi']} />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#C9A84C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Orders by status donut */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 20 }}>POROSITË SIPAS STATUSIT</p>
          {statusData.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', textAlign: 'center', padding: '24px 0' }}>Nuk ka të dhëna.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products bar */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 20 }}>PRODUKTET MË TË SHITURA</p>
          {topProducts.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', textAlign: 'center', padding: '24px 0' }}>Nuk ka të dhëna.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `€${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={(v) => [`€${Number(v).toFixed(2)}`, 'Të ardhura']} />
                <Bar dataKey="revenue" fill="#111" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
