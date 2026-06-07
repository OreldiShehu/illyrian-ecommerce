import SiteLayout from '@/components/layout/SiteLayout'

export const metadata = { title: 'Politika e Cookie-ve — MIO E-Commerce' }

export default function CookiesPage() {
  return (
    <SiteLayout>
      <div className="page-container">
        <div className="page-inner" style={{ maxWidth: 720 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 8 }}>DOKUMENTI LIGJOR</p>
          <h1 className="page-title">POLITIKA E COOKIE-VE</h1>
          <p style={{ fontSize: 12, color: 'var(--gray-mid)', marginBottom: 40 }}>Përditësuar: Janar 2026</p>

          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--gray-dark)', marginBottom: 32 }}>
            Cookie-t janë skedarë të vegjël teksti që ruhen në pajisjen tuaj kur vizitoni faqen tonë. Ato na ndihmojnë të ofrojmë një përvojë më të mirë dhe të kuptojmë si përdoret platforma.
          </p>

          {[
            {
              title: 'COOKIE-T ESENCIALE',
              desc: 'Të domosdoshme',
              body: 'Këto cookie janë të nevojshme për funksionimin bazë të platformës. Përfshijnë token-at e autentifikimit (sesioni i hyrjes), të dhënat e shportës, dhe preferencat e gjuhës. Nuk mund të çaktivizohen.',
            },
            {
              title: 'COOKIE-T ANALITIKE',
              desc: 'Opsionale',
              body: 'Na ndihmojnë të kuptojmë se si vizitorët ndërveprojnë me faqen. Mbledhim statistika si numri i vizitave, kohëzgjatja, dhe faqet më të vizituara. Të dhënat janë anonime.',
            },
            {
              title: 'COOKIE-T E MARKETINGUT',
              desc: 'Vetëm me miratim',
              body: 'Përdoren për të shfaqur reklama të personalizuara bazuar në interesat tuaja. Aktivizohen vetëm nëse jepni miratimin eksplicit.',
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: 32, padding: '20px 24px', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>{section.title}</h2>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: section.desc === 'Të domosdoshme' ? '#15803d' : section.desc === 'Opsionale' ? '#2563eb' : '#d97706', background: section.desc === 'Të domosdoshme' ? '#f0fdf4' : section.desc === 'Opsionale' ? '#eff6ff' : '#fffbeb', padding: '4px 10px', borderRadius: 4 }}>
                  {section.desc.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--gray-dark)' }}>{section.body}</p>
            </div>
          ))}

          <div style={{ background: 'var(--off-white)', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.7 }}>
              Mund të menaxhoni preferencat e cookie-ve në çdo kohë nga cilësimet e shfletuesit tuaj. Për pyetje, kontaktoni <a href="mailto:info@mio-ecommerce.al" style={{ color: 'var(--black)', fontWeight: 600 }}>info@mio-ecommerce.al</a>.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
