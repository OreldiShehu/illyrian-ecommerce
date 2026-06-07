import SiteLayout from '@/components/layout/SiteLayout'

export const metadata = { title: 'Politika e Privatësisë — MIO E-Commerce' }

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <div className="page-container">
        <div className="page-inner" style={{ maxWidth: 720 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 8 }}>DOKUMENTI LIGJOR</p>
          <h1 className="page-title">POLITIKA E PRIVATËSISË</h1>
          <p style={{ fontSize: 12, color: 'var(--gray-mid)', marginBottom: 40 }}>Përditësuar: Janar 2026</p>

          {[
            {
              title: '1. TË DHËNAT QË MBLEDHIM',
              body: 'Mbledhim të dhëna personale si emri, adresa e emailit, numri i telefonit dhe adresa e dorëzimit kur regjistroheni ose kryeni blerje. Mbledhim gjithashtu të dhëna teknikë si adresa IP dhe sjellja në faqe.',
            },
            {
              title: '2. SI I PËRDORIM TË DHËNAT',
              body: 'Të dhënat tuaja përdoren për procesimin e porosive, komunikimin rreth statusit të porosisë, përmirësimin e platformës, dhe dërgimin e ofertave (vetëm nëse keni dhënë miratimin). Nuk shesim të dhëna personale tek palë të treta.',
            },
            {
              title: '3. RUAJTJA DHE SIGURIA',
              body: 'Të dhënat tuaja ruhen në serverë të sigurt (Supabase/AWS) brenda Bashkimit Europian. Përdorim enkriptim SSL/TLS për të gjitha transmetimet. Fjalëkalimet ruhen të enkriptuara dhe nuk mund të aksesohen nga stafi ynë.',
            },
            {
              title: '4. COOKIE-T',
              body: 'Përdorim cookie-t esenciale për funksionimin e platformës (autentifikim, shportë), cookie analitikë për të kuptuar sjelljen e vizitorëve, dhe cookie marketingu vetëm me miratimin tuaj. Shikoni Politikën e Cookie-ve për detaje.',
            },
            {
              title: '5. TË DREJTAT TUAJA',
              body: 'Keni të drejtë të aksesoni, korrigjoni, ose fshini të dhënat tuaja personale. Mund të tërhiqni miratimin për komunikim marketing në çdo kohë. Për të ushtruar këto të drejta, kontaktoni info@mio-ecommerce.al.',
            },
            {
              title: '6. NDRYSHIMET',
              body: 'Mund të përditësojmë këtë politikë herë pas here. Do t\'ju njoftojmë me email për ndryshime të rëndësishme.',
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>{section.title}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--gray-dark)' }}>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  )
}
