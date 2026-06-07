import SiteLayout from '@/components/layout/SiteLayout'

export const metadata = { title: 'Kushtet e Shërbimit — MIO E-Commerce' }

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="page-container">
        <div className="page-inner" style={{ maxWidth: 720 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 8 }}>DOKUMENTI LIGJOR</p>
          <h1 className="page-title">KUSHTET E SHËRBIMIT</h1>
          <p style={{ fontSize: 12, color: 'var(--gray-mid)', marginBottom: 40 }}>Përditësuar: Janar 2026</p>

          {[
            {
              title: '1. PRANIMI I KUSHTEVE',
              body: 'Duke përdorur platformën MIO E-Commerce, ju pranoni plotësisht kushtet e mëposhtme. Nëse nuk pranoni këto kushte, ju lutemi mos e përdorni platformën tonë.',
            },
            {
              title: '2. SHËRBIMI',
              body: 'MIO E-Commerce është një platformë tregu (marketplace) që lidh blerësit me shitësit shqiptarë. Ne veprojmë si ndërmjetës dhe nuk jemi palë direkte në transaksionet ndërmjet blerësve dhe shitësve.',
            },
            {
              title: '3. LLOGARITË',
              body: 'Ju jeni përgjegjës për ruajtjen e fshehtësisë së llogarisë suaj dhe të dhënave të hyrjes. Duhet të na njoftoni menjëherë nëse dyshoni në ndonjë përdorim të paautorizuar të llogarisë suaj.',
            },
            {
              title: '4. POROSITË DHE PAGESAT',
              body: 'Të gjitha çmimet janë në Euro (€) dhe përfshijnë TVSH ku aplikohet. Pagesat pranohen me kartë krediti/debiti dhe cash me dorëzim (COD). Konfirmimi i porosisë dërgohet me email brenda 24 orësh.',
            },
            {
              title: '5. KTHIMET',
              body: 'Produktet mund të kthehen brenda 14 ditëve nga data e marrjes, në kushte origjinale dhe me faturë. Kostoja e kthimit mbulohet nga blerësi, me përjashtim të rasteve kur produkti është defekt.',
            },
            {
              title: '6. KUFIZIMI I PËRGJEGJËSISË',
              body: 'MIO E-Commerce nuk mban përgjegjësi për çështjet që lidhen me cilësinë e produkteve të shitësve të pavarur, vonesat në dorëzim për shkaqe jashtë kontrollit tonë, ose çdo dëm indirekt.',
            },
            {
              title: '7. NDRYSHIMET',
              body: 'Ne rezervojmë të drejtën të ndryshojmë këto kushte në çdo kohë. Ndryshimet hyjnë në fuqi 30 ditë pas publikimit. Vazhdimi i përdorimit të platformës pas ndryshimeve konsiderohet pranim.',
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>{section.title}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--gray-dark)' }}>{section.body}</p>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)' }}>
              Për pyetje rreth këtyre kushteve, na kontaktoni në:{' '}
              <a href="mailto:info@mio-ecommerce.al" style={{ color: 'var(--black)', fontWeight: 600 }}>info@mio-ecommerce.al</a>
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
