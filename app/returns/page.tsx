import SiteLayout from '@/components/layout/SiteLayout'

export const metadata = { title: 'Kthimet & Shkëmbimet — MIO E-Commerce' }

export default function ReturnsPage() {
  return (
    <SiteLayout>
      <div className="page-container">
        <div className="page-inner" style={{ maxWidth: 720 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 8 }}>POLITIKA</p>
          <h1 className="page-title">KTHIMET &amp; SHKËMBIMET</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-dark)', marginBottom: 40, lineHeight: 1.8 }}>
            Ne dëshirojmë të jeni plotësisht të kënaqur me blerjen tuaj. Nëse nuk jeni, ja si funksionon procesi i kthimit.
          </p>

          <div style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
            {[
              { icon: '📅', title: '14 DITË', desc: 'Keni 14 ditë nga marrja e produktit për të iniciuar një kthim.' },
              { icon: '📦', title: 'PAKETIM ORIGJINAL', desc: 'Produkti duhet të jetë i papërdorur, me etiketa dhe në paketimin origjinal.' },
              { icon: '🧾', title: 'FATURA', desc: 'Duhet të keni faturën ose konfirmimin e porosisë.' },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: 16, padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {[
            {
              title: 'SI TË INICIONI NJË KTHIM',
              body: '1. Kontaktoni shitësin direkt nëpërmjet WhatsApp ose email brenda 14 ditëve.\n2. Konfirmoni arsyen e kthimit dhe jepni numrin e porosisë.\n3. Shitësi do t\'ju japë instruksionet e dërgimit.\n4. Rimbursimi processohet brenda 5–10 ditëve pune pas marrjes së produktit.',
            },
            {
              title: 'PRODUKTET QË NUK MUND TË KTHEHEN',
              body: 'Produkte të personalizuara ose me porosi speciale · Produkte higjenike (çorape, të brendshme) · Produkte që janë dëmtuar nga keqpërdorimi · Produkte me etiketa të hequra ose të papërdorura',
            },
            {
              title: 'PRODUKTI DEFEKT',
              body: 'Nëse keni marrë një produkt defekt ose të ndryshëm nga ai i porositur, na kontaktoni brenda 48 orëve. Kostoja e kthimit mbulohet plotësisht nga ne dhe rimbursimi processohet me prioritet.',
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>{section.title}</h2>
              <div style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--gray-dark)', whiteSpace: 'pre-line' }}>{section.body}</div>
            </div>
          ))}

          <div style={{ background: 'var(--black)', color: 'var(--white)', borderRadius: 10, padding: '20px 24px', marginTop: 16 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 8 }}>KA PYETJE?</p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>
              Na kontaktoni dhe do t&apos;ju ndihmojmë brenda 24 orësh.
            </p>
            <a href="/contact" style={{ display: 'inline-block', marginTop: 12, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--white)', borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
              NA KONTAKTO →
            </a>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
