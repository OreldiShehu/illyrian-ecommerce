import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'
import { ORDER_STATUSES } from '@/types'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    vendorsResult,
    ordersResult,
    pendingVendorsResult,
    commResult,
    usersResult,
  ] = await Promise.all([
    supabase.from('vendors').select('id, status').eq('is_active', true),
    supabase
      .from('orders')
      .select('id, total, status, created_at, shipping_name')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(12),
    supabase.from('vendors').select('id, store_name, city, category, created_at, users(email, name)').eq('status', 'pending'),
    supabase.from('commission_ledger').select('amount_owed, status').eq('status', 'pending'),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])

  const vendors = vendorsResult.data ?? []
  const recentOrders = ordersResult.data ?? []
  const pendingVendors = pendingVendorsResult.data ?? []
  const pendingComms = commResult.data ?? []
  const userCount = usersResult.count ?? 0

  const gmv30d = recentOrders
    .filter((o) => ['confirmed', 'shipped', 'delivered'].includes(o.status))
    .reduce((s, o) => s + o.total, 0)
  const pendingCommTotal = pendingComms.reduce((s, c) => s + c.amount_owed, 0)
  const activeVendors = vendors.filter((v) => v.status === 'active').length

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>PANELI KRYESOR</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>OVERVIEW</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'GMV (30 DITË)', value: formatPrice(gmv30d), sub: 'porosi të konfirmuara' },
          { label: 'SHITËS AKTIVË', value: activeVendors.toString(), sub: `${pendingVendors.length} në pritje` },
          { label: 'KOMISIONE NË PRITJE', value: formatPrice(pendingCommTotal), sub: `${pendingComms.length} transaksione` },
          { label: 'KLIENTË TOTAL', value: userCount.toString(), sub: 'të regjistruar' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ background: 'var(--white)' }}>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--gray-dark)', marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Recent orders */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em' }}>POROSITË RECENTE (30 DITË)</p>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ padding: '24px 20px', fontSize: 13, color: 'var(--gray-dark)' }}>Nuk ka porosi.</p>
          ) : (
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>POROSIA</th>
                  <th>KLIENTI</th>
                  <th>TOTALI</th>
                  <th>STATUSI</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>#{generateOrderNumber(order.id)}</td>
                    <td style={{ fontSize: 12 }}>{order.shipping_name}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>{formatPrice(order.total)}</td>
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

        {/* Pending vendors */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em' }}>APLIKIMET E REJA ({pendingVendors.length})</p>
            {pendingVendors.length > 0 && (
              <a href="/admin/vendors" style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', textDecoration: 'none' }}>SHIKO TË GJITHA →</a>
            )}
          </div>
          {pendingVendors.length === 0 ? (
            <p style={{ padding: '24px 20px', fontSize: 13, color: 'var(--gray-dark)' }}>Nuk ka aplikime të reja. ✓</p>
          ) : (
            <div>
              {pendingVendors.map((v) => (
                <div key={v.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-light)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{v.store_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginBottom: 3 }}>{(v as any).users?.email ?? ''}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-dark)' }}>{v.city} · {v.category}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 2 }}>{formatDate(v.created_at)}</p>
                </div>
              ))}
              <div style={{ padding: '12px 20px' }}>
                <a href="/admin/vendors" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', textDecoration: 'none' }}>MENAXHO SHITËSIT →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
