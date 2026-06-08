import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'vendor' && userData?.role !== 'admin') redirect('/')

  const { data: vendor } = await supabase.from('vendors').select('store_name, status').eq('user_id', user.id).single()

  // Unread notifications count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  const unread = unreadCount ?? 0

  const NAV_ITEMS = [
    { href: '/vendor/dashboard', label: 'PANELI', icon: '◈', badge: 0 },
    { href: '/vendor/products', label: 'PRODUKTET', icon: '◧', badge: 0 },
    { href: '/vendor/orders', label: 'POROSITË', icon: '◎', badge: unread },
    { href: '/vendor/analytics', label: 'ANALITIKA', icon: '◉', badge: 0 },
    { href: '/vendor/commissions', label: 'KOMISIONET', icon: '◇', badge: 0 },
  ]

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>MIO E-COMMERCE</p>
          <p className="sidebar-logo-text">{vendor?.store_name?.toUpperCase() ?? 'DYQANI'}</p>
          {vendor?.status === 'pending' && (
            <p style={{ fontSize: 10, color: '#C9A84C', marginTop: 4, fontFamily: 'var(--font-display)' }}>NË PRITJE APROVIMI</p>
          )}
          {vendor?.status === 'rejected' && (
            <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4, fontFamily: 'var(--font-display)' }}>REFUZUAR</p>
          )}
        </div>
        <ul className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 6px',
                    minWidth: 18,
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
          <li style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
            <Link href="/">
              <span>←</span>
              KTHEHU NË SITE
            </Link>
          </li>
        </ul>
      </aside>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}
