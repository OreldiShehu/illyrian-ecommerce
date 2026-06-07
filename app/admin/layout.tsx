import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const NAV_ITEMS = [
  { href: '/admin', label: 'OVERVIEW', icon: '◈' },
  { href: '/admin/vendors', label: 'SHITËSIT', icon: '◧' },
  { href: '/admin/orders', label: 'POROSITË', icon: '◎' },
  { href: '/admin/commissions', label: 'KOMISIONET', icon: '◇' },
  { href: '/admin/featured', label: 'TË VEÇUARIT', icon: '★' },
  { href: '/admin/coupons', label: 'KUPONAT', icon: '◉' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>MIO E-COMMERCE</p>
          <p className="sidebar-logo-text">ADMIN</p>
          <p style={{ fontSize: 10, color: '#C9A84C', marginTop: 4, fontFamily: 'var(--font-display)' }}>PANELI KRYESOR</p>
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
