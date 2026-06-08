'use client'

import Link from 'next/link'
import { useLanguage, type Locale } from '@/lib/i18n'

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'sq', label: 'SQ' },
  { code: 'en', label: 'EN' },
  { code: 'it', label: 'IT' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: Props) {
  const { t, locale, setLocale } = useLanguage()

  return (
    <>
      <div className={`mobile-drawer${open ? ' open' : ''}`} id="mobileDrawer">
        {/* Header */}
        <div className="drawer-header">
          <div>
            <div className="drawer-brand">MIO E-COMMERCE</div>
            <div className="drawer-brand-sub">DISCOVER · COMPARE · ORDER</div>
          </div>
          <button onClick={onClose} className="drawer-close" aria-label="Close menu">×</button>
        </div>

        {/* Nav links */}
        <ul>
          <li><Link href="/" onClick={onClose}>{t('nav.home')}</Link></li>
          <li><Link href="/stores" onClick={onClose}>{t('nav.stores')}</Link></li>
          <li><Link href="/stores?filter=offers" onClick={onClose}>{t('nav.offers')}</Link></li>
          <li><Link href="/stores?filter=new" onClick={onClose}>{t('nav.new')}</Link></li>
          <li><Link href="/vendor/onboarding" onClick={onClose}>{t('nav.sell')}</Link></li>
        </ul>

        {/* Account links */}
        <div className="drawer-bottom">
          <Link href="/auth/login" onClick={onClose}>{t('nav.login')}</Link>
          <Link href="/auth/register" onClick={onClose}>{t('nav.register')}</Link>
          <Link href="/account" onClick={onClose}>{t('nav.account')}</Link>
          <Link href="/checkout" onClick={onClose}>{t('nav.cart')}</Link>
        </div>

        {/* Language switcher */}
        <div className="drawer-lang">
          <span className="drawer-lang-label">LANGUAGE</span>
          <div className="drawer-lang-btns">
            {LOCALES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className={`drawer-lang-btn${locale === code ? ' active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`drawer-overlay${open ? ' show' : ''}`}
        onClick={onClose}
      />
    </>
  )
}
