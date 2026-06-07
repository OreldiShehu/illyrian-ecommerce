import SiteLayout from '@/components/layout/SiteLayout'

export const metadata = { title: 'Dërgesa — MIO E-Commerce' }

export default function ShippingPage() {
  return (
    <SiteLayout>
      <div className="page-container">
        <div className="page-inner" style={{ maxWidth: 720 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 8 }}>INFORMACION</p>
          <h1 className="page-title">DËRGESA</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-dark)', marginBottom: 40, lineHeight: 1.8 }}>
            Çdo shitës menaxhon dorëzimet e veta. Informacioni i mëposhtëm është i përgjithshëm dhe mund të ndryshojë sipas shitësit.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
            {[
              { label: 'TIRANA & RRETHINAT', time: '1–2 ditë pune', price: '€2–4', color: '#15803d' },
              { label: 'QYTETET KRYESORE', time: '2–3 ditë pune', price: '€3–5', color: '#2563eb' },
              { label: 'ZONAT RURALE', time: '3–5 ditë pune', price: '€4–6', color: '#d97706' },
              { label: 'NDËRKOMBËTARE', time: 'E disponueshme', price: 'Sipas shitësit', color: '#7c3aed' },
            ].map((zone) => (
              <div key={zone.label} style={{ padding: '20px 24px', border: '1px solid var(--border)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: zone.color, marginBottom: 8 }}>{zone.label}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{zone.time}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-dark)' }}>Kostoja: {zone.price}</p>
              </div>
            ))}
          </div>

          {[
            {
              title: 'METODAT E PAGESËS',
              body: 'Pranojmë pagesë me kartë krediti/debiti (Visa, Mastercard) dhe Cash me Dorëzim (COD). Pagesa COD kryhet direkt te korrieri gjatë marrjes së paketës.',
            },
            {
              title: 'GJURMIMI I POROSISË',
              body: 'Pasi porosia konfirmohet nga shitësi, do të merrni një email me të dhënat e gjurmimit. Mund të kontrolloni statusin e porosisë në faqen "Llogaria Ime" → "Porositë".',
            },
            {
              title: 'PAKETAT E DËMTUARA',
              body: 'Nëse paketën e merrni të dëmtuar, fotografoni paketimin para hapjes dhe na kontaktoni brenda 24 orësh. Do t\'ju ndihmojmë të zgjidhni problemin me shitësin.',
            },
            {
              title: 'POROSI TË SHUMTA',
              body: 'Nëse keni porositur nga shitës të ndryshëm, do të merrni paketa të ndara. Çdo shitës dërgon porosinë e vet.',
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>{section.title}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--gray-dark)' }}>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  )
}
