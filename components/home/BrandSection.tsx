import Link from 'next/link'

export default function BrandSection() {
  return (
    <section className="brand-section">
      <div className="brand-text">
        <p className="brand-eyebrow">ZAZA&apos;S E-COMMERCE — EST. 2025</p>
        <h2 className="brand-headline">Moda Shqiptare<br />në një vend</h2>
        <p className="brand-body">
          Zaza&apos;s E-Commerce mbledh dyqanet më të mira shqiptare të modës në një platformë — zbulo, krahaso dhe porosit me besim.
        </p>
        <p className="brand-body">
          Nga streetwear te luxury — çdo dyqan, çdo produkt, një platformë.
        </p>
        <p className="brand-body brand-italic">
          Zaza&apos;s E-Commerce — Rajoni yt. Dyqanet e tua. Zgjedhja jote.
        </p>
        <Link href="/stores" className="brand-cta">SHIKO TË GJITHA DYQANET</Link>
      </div>
      <div className="brand-visual">
        <div className="brand-visual-text">DISCOVER<br />COMPARE<br />ORDER</div>
      </div>
    </section>
  )
}
