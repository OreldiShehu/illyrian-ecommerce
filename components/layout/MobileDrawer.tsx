'use client'

import Link from 'next/link'

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: Props) {
  return (
    <>
      <div className={`mobile-drawer${open ? ' open' : ''}`} id="mobileDrawer">
        <ul>
          <li><Link href="/" onClick={onClose}>HOME</Link></li>
          <li><Link href="/stores" onClick={onClose}>STORES</Link></li>
          <li><Link href="/stores?filter=offers" onClick={onClose}>OFFERS</Link></li>
          <li><Link href="/stores?filter=new" onClick={onClose}>NEW</Link></li>
          <li><Link href="/vendor/onboarding" onClick={onClose}>SHIT ME NE</Link></li>
        </ul>
        <div className="drawer-bottom">
          <Link href="/auth/login" onClick={onClose}>Hyr</Link>
          <Link href="/auth/register" onClick={onClose}>Regjistrohu</Link>
          <Link href="/account" onClick={onClose}>Llogaria</Link>
          <Link href="/checkout" onClick={onClose}>Shporta</Link>
        </div>
      </div>
      <div
        className={`drawer-overlay${open ? ' show' : ''}`}
        onClick={onClose}
      />
    </>
  )
}
