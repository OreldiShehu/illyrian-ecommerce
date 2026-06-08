import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand-col">
          <div className="footer-logo">MIO E-COMMERCE</div>
          <div className="footer-logo-sub">DISCOVER · COMPARE · ORDER</div>
          <p className="footer-tagline">Platforma e modës shqiptare online.</p>
          <div className="footer-socials">
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="https://tiktok.com" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
              </svg>
            </a>
            <a href="https://wa.me/355692866668" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21" />
                <path d="M9 10c0 5 3.5 7.5 6 5" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">LINKS</div>
          <ul>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">NDIHMË</div>
          <ul>
            <li><Link href="/returns">Kthimet &amp; Shkëmbimet</Link></li>
            <li><Link href="/shipping">Dërgesa</Link></li>
            <li><Link href="/vendor/onboarding">Regjistro Dyqanin Tënd</Link></li>
            <li><Link href="/contact">Na Kontakto</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">GJUHA</div>
          <ul>
            <li><Link href="/" className="active-lang">Shqip</Link></li>
            <li><Link href="/en">English</Link></li>
            <li><Link href="/it">Italiano</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 MIO E-COMMERCE. Të gjitha të drejtat e rezervuara.</span>
        <div className="payment-methods">
          <span>VISA</span>
          <span>MC</span>
          <span>CASH</span>
        </div>
      </div>
    </footer>
  )
}
