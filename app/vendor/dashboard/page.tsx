import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, generateOrderNumber } from '@/lib/utils'
import { ORDER_STATUSES } from '@/types'

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, store_name, status, commission_rate')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/vendor/onboarding')
  if ((vendor as any).status === 'pending') {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: 40, maxWidth: 520 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 12 }}>NË PRITJE APROVIMI</p>
          <p style={{ fontSize: 14, color: 'var(--gray-dark)', lineHeight: 1.7 }}>
            Aplikimi juaj është duke u shqyrtuar. Do të merrni email brenda 24 orësh.
          </p>
        </div>
      </div>
    )
  }

  const now = new Date().toISOString()

  // orders has no vendor_id column — go through order_items
  const [vendorItemsResult, productsResult, flashSaleResult, commResult] = await Promise.all([
    supabase
      .from('order_items')
      .select('order_id, price, quantity, orders(id, status, total, created_at, shipping_name)')
      .eq('vendor_id', vendor.id),

    supabase
      .from('products')
      .select('id, name, stock, price')
      .eq('vendor_id', vendor.id)
      .eq('is_active', true),

    supabase
      .from('flash_sales')
      .select('id')
      .eq('vendor_id', vendor.id)
      .eq('is_active', true)
      .gt('ends_at', now),

    supabase
      .from('commission_ledger')
      .select('amount_owed, status')
      .eq('vendor_id', vendor.id)
      .eq('status', 'pending'),
  ])

  const vendorItems = vendorItemsResult.data ?? []

  // Deduplicate to unique orders sorted newest-first
  const orderMap = new Map<string, any>()
  vendorItems.forEach((item) => {
    const i = item as any
    const order = i.orders
    if (order && !orderMap.has(i.order_id)) orderMap.set(i.order_id, order)
  })
  const allOrders = Array.from(orderMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const orders = allOrders.slice(0, 8)

  // Revenue = vendor's item totals only (not full order total which may include other vendors)
  const totalRevenue = vendorItems
    .filter((item) => ['confirmed', 'shipped', 'delivered'].includes((item as any).orders?.status ?? ''))
    .reduce((s, item) => s + (item as any).price * (item as any).quantity, 0)

  const products = productsResult.data ?? []
  const flashSales = flashSaleResult.data ?? []
  const pendingComms = commResult.data ?? []

  const pendingCommTotal = pendingComms.reduce((s, c) => s + c.amount_owed, 0)
  const lowStockProducts = products.filter((p) => p.stock <= 5)
  const totalProducts = products.length
  const pendingOrders = allOrders.filter((o) => o.status === 'pending').length

  return (
    <div style={{ padding: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>PANELI I MENAXHIMIT</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>{vendor.store_name.toUpperCase()}</h1>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'TË ARDHURAT TOTALE', value: formatPrice(totalRevenue), sub: 'porosi të konfirmuara/dërguara' },
          { label: 'PRODUKTE AKTIVE', value: totalProducts.toString(), sub: lowStockProducts.length > 0 ? `${lowStockProducts.length} me stok të ulët` : 'stok normal' },
          { label: 'POROSI NË PRITJE', value: pendingOrders.toString(), sub: pendingOrders > 0 ? 'Kërkon vëmendje' : 'Asgjë në pritje' },
          { label: 'KOMISIONE PENDENTE', value: formatPrice(pendingCommTotal), sub: `${pendingComms.length} transaksione` },
        ].map((stat) => (
          <div key={stat.label} className="stat-card" style={{ background: 'var(--white)' }}>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p style={{ fontSize: 11, color: 'var(--gray-dark)', marginTop: 4 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Recent orders */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em' }}>POROSITË E FUNDIT</p>
            <Link href="/vendor/orders" style={{ fontSize: 11, color: 'var(--gray-dark)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none' }}>SHIKO TË GJITHA →</Link>
          </div>
          {orders.length === 0 ? (
            <p style={{ padding: '24px 20px', fontSize: 13, color: 'var(--gray-dark)' }}>Nuk keni porosi ende.</p>
          ) : (
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>POROSIA</th>
                  <th>KLIENTI</th>
                  <th>DATA</th>
                  <th>TOTALI</th>
                  <th>STATUSI</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/vendor/orders`} style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--black)', textDecoration: 'none' }}>
                        #{generateOrderNumber(order.id)}
                      </Link>
                    </td>
                    <td style={{ fontSize: 12 }}>{order.shipping_name}</td>
                    <td style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{formatDate(order.created_at)}</td>
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

        {/* Side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Low stock */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em' }}>STOK I ULËT</p>
            </div>
            {lowStockProducts.length === 0 ? (
              <p style={{ padding: '16px 20px', fontSize: 12, color: 'var(--gray-dark)' }}>Asnjë produkt me stok të ulët ✓</p>
            ) : (
              <div>
                {lowStockProducts.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--gray-light)', alignItems: 'center' }}>
                    <p style={{ fontSize: 12, flex: 1, marginRight: 8 }}>{p.name}</p>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: p.stock === 0 ? '#dc2626' : '#d97706',
                      background: p.stock === 0 ? '#fef2f2' : '#fffbeb',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {p.stock === 0 ? 'I MBARUAR' : `${p.stock} mbetur`}
                    </span>
                  </div>
                ))}
                <div style={{ padding: '10px 20px' }}>
                  <Link href="/vendor/products" style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', textDecoration: 'none' }}>
                    MENAXHO PRODUKTET →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Flash sales */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 12 }}>FLASH SALE AKTIVE</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: '#C9A84C', marginBottom: 4 }}>{flashSales.length}</p>
            <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 12 }}>promovime aktive</p>
            <Link href="/vendor/products" style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', textDecoration: 'none' }}>
              {flashSales.length > 0 ? 'SHIKO FLASH SALES →' : 'KRIJO FLASH SALE →'}
            </Link>
          </div>

          {/* Quick links */}
          <div style={{ background: 'var(--black)', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>LIDHJE TË SHPEJTA</p>
            {[
              { href: '/vendor/products', label: 'Shto produkt të ri' },
              { href: '/vendor/orders', label: 'Shiko porositë' },
              { href: '/vendor/analytics', label: 'Shiko analitikën' },
              { href: '/vendor/commissions', label: 'Komisionet' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.8)', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'color 0.2s' }}>
                → {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
