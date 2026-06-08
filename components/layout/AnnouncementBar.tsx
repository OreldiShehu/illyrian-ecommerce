'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'

export default function AnnouncementBar() {
  const { t } = useLanguage()

  return (
    <div className="announce-bar">
      <span>{t('announce.shipping')}</span>
      <span className="sep">·</span>
      <span>{t('announce.new_stores')}</span>
      <span className="sep">·</span>
      <span>
        <Link href="/auth/register">{t('announce.discount')}</Link>
      </span>
    </div>
  )
}
