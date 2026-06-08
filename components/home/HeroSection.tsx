import Link from 'next/link'
import { getT } from '@/lib/i18n-server'

export default async function HeroSection() {
  const t = await getT()
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-tag">{t('hero.tag')}</p>
        <h1 className="hero-title">
          MIO<br />E-COMMERCE
        </h1>
        <p className="hero-sub">{t('hero.sub')}</p>
        <Link href="/stores" className="hero-btn">{t('hero.btn')}</Link>
      </div>
      <div className="hero-overlay" />
    </section>
  )
}
