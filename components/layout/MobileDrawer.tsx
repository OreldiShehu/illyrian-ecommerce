'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import LanguageSwitcher from './LanguageSwitcher'

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: Props) {
  const { t } = useLanguage()

  return (
    <>
      <div className={`mobile-drawer${open ? ' open' : ''}`} id="mobileDrawer">
        <ul>
          <li><Link href="/" onClick={onClose}>{t('nav.home')}</Link></li>
          <li><Link href="/stores" onClick={onClose}>{t('nav.stores')}</Link></li>
          <li><Link href="/stores?filter=offers" onClick={onClose}>{t('nav.offers')}</Link></li>
          <li><Link href="/stores?filter=new" onClick={onClose}>{t('nav.new')}</Link></li>
          <li><Link href="/vendor/onboarding" onClick={onClose}>{t('nav.sell')}</Link></li>
        </ul>
        <div className="drawer-bottom">
          <Link href="/auth/login" onClick={onClose}>{t('nav.login')}</Link>
          <Link href="/auth/register" onClick={onClose}>{t('nav.register')}</Link>
          <Link href="/account" onClick={onClose}>{t('nav.account')}</Link>
          <Link href="/checkout" onClick={onClose}>{t('nav.cart')}</Link>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <LanguageSwitcher />
        </div>
      </div>
      <div
        className={`drawer-overlay${open ? ' show' : ''}`}
        onClick={onClose}
      />
    </>
  )
}
