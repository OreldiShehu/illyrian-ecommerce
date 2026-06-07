import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const NAV_ITEMS = [
  { href: '/vendor/dashboard', label: 'PANELI', icon: '◈' },
  { href: '/vendor/products', label: 'PRODUKTET', icon: '◧' },
  { href: '/vendor/orders', label: 'POROSITË', icon: '◎' },
  { href: '/vendor/analytics', label: 'ANALITIKA', icon: '◉' },
  { href: '/vendor/commissions', label: 'KOMISIONET', icon: '◇' },
]

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'vendor' && userData?.role !== 'admin') redirect('/')

  const { data: vendor } = await supabase.from('vendors').select('store_name, status').eq('user_id', user.id).single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
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
              <Link href={item.href}>
                <span>{item.icon}</span>
                {item.label}
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
      <main style={{ flex: 1, background: 'var(--off-white)', minHeight: '100vh', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
