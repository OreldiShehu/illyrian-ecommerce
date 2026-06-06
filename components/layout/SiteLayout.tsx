'use client'

import { useState } from 'react'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import MobileDrawer from './MobileDrawer'
import Footer from './Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <AnnouncementBar />
      <Navbar mobileMenuOpen={mobileOpen} onToggleMobile={() => setMobileOpen((v) => !v)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
