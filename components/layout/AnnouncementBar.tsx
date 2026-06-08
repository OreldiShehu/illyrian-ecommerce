'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'

export default function AnnouncementBar() {
  const { t } = useLanguage()

  const items = (
    <>
      <span className="announce-item">{t('announce.shipping')}</span>
      <span className="announce-dot">★</span>
      <span className="announce-item">{t('announce.new_stores')}</span>
      <span className="announce-dot">★</span>
      <span className="announce-item">
        <Link href="/auth/register">{t('announce.discount')}</Link>
      </span>
      <span className="announce-dot">★</span>
    </>
  )

  return (
    <div className="announce-bar">
      <div className="announce-track">
        {items}
        {items}
        {items}
      </div>
    </div>
  )
}
