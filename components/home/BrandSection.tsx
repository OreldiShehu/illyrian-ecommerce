import Link from 'next/link'
import Image from 'next/image'

export default function BrandSection() {
  return (
    <section className="brand-section">
      <div className="brand-text">
        <p className="brand-eyebrow">MIO E-COMMERCE — EST. 2025</p>
        <h2 className="brand-headline">Moda Shqiptare<br />në një vend</h2>
        <p className="brand-body">
          MIO E-COMMERCE mbledh dyqanet më të mira shqiptare të modës në një platformë — zbulo, krahaso dhe porosit me besim.
        </p>
        <p className="brand-body">
          Nga streetwear te luxury — çdo dyqan, çdo produkt, një platformë.
        </p>
        <p className="brand-body brand-italic">
          MIO E-COMMERCE — Rajoni yt. Dyqanet e tua. Zgjedhja jote.
        </p>
        <Link href="/stores" className="brand-cta">SHIKO TË GJITHA DYQANET</Link>
      </div>
      <div className="brand-visual" style={{ position: 'relative', overflow: 'hidden', borderRadius: 10, padding: 0 }}>
        <Image
          src="/brand-store.jpg"
          alt="Fashion store interior"
          fill
          className="object-cover"
          sizes="(max-width: 900px) 100vw, 50vw"
          quality={90}
        />
      </div>
    </section>
  )
}
