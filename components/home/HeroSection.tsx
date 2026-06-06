import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-tag">MODA SHQIPTARE — FASHION ALBANIAN</p>
        <h1 className="hero-title">
          ZAZA&apos;S<br />E-COMMERCE
        </h1>
        <p className="hero-sub">DISCOVER &nbsp;·&nbsp; COMPARE &nbsp;·&nbsp; ORDER</p>
        <Link href="/stores" className="hero-btn">EXPLORE STORES</Link>
      </div>
      <div className="hero-overlay" />
    </section>
  )
}
