'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useCartStore } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Props {
  mobileMenuOpen: boolean
  onToggleMobile: () => void
}

export default function Navbar({ mobileMenuOpen, onToggleMobile }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const itemCount = useCartStore((s) => s.itemCount)
  const supabase = createClient()
  const initialized = useRef(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-left">
        <button
          className={`hamburger${mobileMenuOpen ? ' open' : ''}`}
          onClick={onToggleMobile}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
        <ul className="nav-links">
          <li><Link href="/" className="active">BALLINA</Link></li>
          <li><Link href="/stores">DYQANET</Link></li>
          <li><Link href="/stores?filter=offers">OFERTAT</Link></li>
          <li><Link href="/stores?filter=new">TË REJA</Link></li>
          <li><Link href="/vendor/onboarding">SHIT ME NE</Link></li>
        </ul>
      </div>

      <div className="nav-logo">
        <span className="logo-main">MIO E-COMMERCE</span>
        <span className="logo-sub">DISCOVER &nbsp;·&nbsp; COMPARE &nbsp;·&nbsp; ORDER</span>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <Link href="/account">LLOGARIA</Link>
            <button
              onClick={handleSignOut}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--black)' }}
            >
              DIL
            </button>
          </>
        ) : (
          <Link href="/auth/login">HYR</Link>
        )}
        <Link href="/account" className="icon-btn" title="Llogaria">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
        <Link href="/checkout" className="icon-btn bag-btn" title="Shporta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {itemCount > 0 && (
            <span className="bag-count">{itemCount > 99 ? '99+' : itemCount}</span>
          )}
        </Link>
      </div>
    </nav>
  )
}
