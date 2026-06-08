'use client'

import { useState } from 'react'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import MobileDrawer from './MobileDrawer'
import CartSidebar from './CartSidebar'
import Footer from './Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <AnnouncementBar />
      <Navbar mobileMenuOpen={mobileOpen} onToggleMobile={() => setMobileOpen((v) => !v)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartSidebar />
      <main>{children}</main>
      <Footer />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/355692866668"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Na kontaktoni në WhatsApp"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#111',
          border: '1.5px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)'
          ;(e.currentTarget as HTMLAnchorElement).style.background = '#000'
          ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.5)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLAnchorElement).style.background = '#111'
          ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.35)'
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.797 1.832 6.793L2 30l7.418-1.805A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="white"/>
          <path d="M23.01 19.61c-.32-.16-1.89-.93-2.18-1.04-.29-.1-.5-.16-.71.16-.21.32-.82 1.04-.1 1.25.29.1.82.43 1.39.82.57.39.57.39.57.39s-.18.29-.39.5c-1.46 1.5-4.04 1.29-5.61-.29-1.61-1.61-1.75-4.21-.25-5.89.18-.21.43-.29.68-.29.21 0 .43.07.61.18.43.25.86.86.96 1.07.1.21.05.43-.05.61-.1.18-.29.39-.43.54-.14.14-.29.32-.14.57.14.25.64 1.04 1.39 1.68.96.82 1.75 1.07 2.0 1.18.25.11.43.07.57-.07.14-.14.61-.71.79-.96.18-.25.36-.21.61-.11z" fill="#111"/>
        </svg>
      </a>
    </>
  )
}
