import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'
import { createClient } from '@/lib/supabase/server'
import { getT, getLocale } from '@/lib/i18n-server'
import type { Locale } from '@/lib/i18n'

export const revalidate = 3600

async function getStats() {
  const supabase = await createClient()
  const [vendorRes, productRes] = await Promise.all([
    supabase.from('vendors').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])
  return {
    vendors: vendorRes.count ?? 0,
    products: productRes.count ?? 0,
  }
}

type Step = { num: string; title: string; desc: string }
type Benefit = { icon: string; title: string; desc: string }
type Plan = { name: string; price: string; period: string; highlight: boolean; features: string[]; cta: string; href: string }
type Faq = { q: string; a: string }

const STEPS: Record<Locale, Step[]> = {
  sq: [
    { num: '01', title: 'Regjistrohu falas', desc: 'Krijo llogarinë tënde dhe plotëso detajet e dyqanit — emri, kategoria, qyteti, logo dhe bio. Gati në 5 minuta.' },
    { num: '02', title: 'Shto produktet tua', desc: 'Ngarko fotot, vendos çmimet dhe përshkrimet. Plani falas lejon deri 20 produkte. Plani Pro është i pakufizuar.' },
    { num: '03', title: 'Merr porositë', desc: 'Klientët gjejnë dyqanin tënd, blejnë, dhe ti merr njoftim menjëherë — email + WhatsApp. Ti konfirmon dhe dërgon.' },
  ],
  en: [
    { num: '01', title: 'Register for free', desc: 'Create your account and fill in your store details — name, category, city, logo and bio. Ready in 5 minutes.' },
    { num: '02', title: 'Add your products', desc: 'Upload photos, set prices and descriptions. The free plan allows up to 20 products. The Pro plan is unlimited.' },
    { num: '03', title: 'Receive orders', desc: 'Customers find your store, buy, and you get notified immediately — email + WhatsApp. You confirm and ship.' },
  ],
  it: [
    { num: '01', title: 'Registrati gratuitamente', desc: 'Crea il tuo account e compila i dettagli del negozio — nome, categoria, città, logo e bio. Pronto in 5 minuti.' },
    { num: '02', title: 'Aggiungi i tuoi prodotti', desc: 'Carica le foto, imposta prezzi e descrizioni. Il piano gratuito consente fino a 20 prodotti. Il piano Pro è illimitato.' },
    { num: '03', title: 'Ricevi ordini', desc: 'I clienti trovano il tuo negozio, acquistano, e ricevi una notifica immediata — email + WhatsApp. Tu confermi e spedisci.' },
  ],
}

const BENEFITS: Record<Locale, Benefit[]> = {
  sq: [
    { icon: '📱', title: 'Dyqan online në minuta', desc: 'Pa nevojë për programues apo dizajner. Platforma jonë të jep faqe të gatshme për dyqanin tënd.' },
    { icon: '🛒', title: 'Klientë të gatshëm', desc: 'Klientët shqiptarë kërkojnë produkte drejtpërdrejt në platformë — ti jeton ku ata janë.' },
    { icon: '🔔', title: 'Njoftim çdo porosi', desc: 'Merr njoftim me email dhe WhatsApp për çdo porosi të re. Asnjë porosi nuk humbet.' },
    { icon: '📊', title: 'Analitika e dyqanit', desc: 'Shih të ardhurat, produktet më të shitura, dhe statusin e porosive — të gjitha në një panel.' },
    { icon: '💰', title: 'Komision transparent', desc: 'Vetëm 12% komision për çdo shitje. Asnjë tarifë mujore të fshehur në planin falas.' },
    { icon: '🏷️', title: 'Flash Sales & Kupona', desc: 'Krijo zbritje me kohë të kufizuar dhe kode kuponi për të rritur shitjet.' },
  ],
  en: [
    { icon: '📱', title: 'Online store in minutes', desc: 'No developer or designer needed. Our platform gives you a ready-made store page.' },
    { icon: '🛒', title: 'Ready customers', desc: 'Customers search for products directly on the platform — you are where they are.' },
    { icon: '🔔', title: 'Notification per order', desc: 'Receive email and WhatsApp notifications for every new order. No order gets lost.' },
    { icon: '📊', title: 'Store analytics', desc: 'See revenue, best-selling products, and order status — all in one dashboard.' },
    { icon: '💰', title: 'Transparent commission', desc: 'Only 12% commission per sale. No hidden monthly fees on the free plan.' },
    { icon: '🏷️', title: 'Flash Sales & Coupons', desc: 'Create limited-time discounts and coupon codes to boost sales.' },
  ],
  it: [
    { icon: '📱', title: 'Negozio online in minuti', desc: 'Nessun sviluppatore o designer necessario. La nostra piattaforma ti dà una pagina negozio pronta.' },
    { icon: '🛒', title: 'Clienti pronti', desc: 'I clienti cercano prodotti direttamente sulla piattaforma — sei dove si trovano loro.' },
    { icon: '🔔', title: 'Notifica per ogni ordine', desc: 'Ricevi notifiche email e WhatsApp per ogni nuovo ordine. Nessun ordine va perso.' },
    { icon: '📊', title: 'Analisi del negozio', desc: 'Guarda entrate, prodotti più venduti e stato degli ordini — tutto in un pannello.' },
    { icon: '💰', title: 'Commissione trasparente', desc: 'Solo il 12% di commissione per ogni vendita. Nessuna tariffa mensile nascosta nel piano gratuito.' },
    { icon: '🏷️', title: 'Flash Sales & Coupon', desc: 'Crea sconti a tempo limitato e codici coupon per aumentare le vendite.' },
  ],
}

const PLANS: Record<Locale, Plan[]> = {
  sq: [
    {
      name: 'FALAS', price: '€0', period: '/ muaj', highlight: false,
      features: ['Deri 20 produkte', 'Faqe dyqani personale', 'Njoftim me email', 'Analitika bazë', 'Flash sales', 'Komision 12%'],
      cta: 'FILLO FALAS', href: '/vendor/onboarding',
    },
    {
      name: 'PRO', price: '€15', period: '/ muaj', highlight: true,
      features: ['Produkte të pakufizuara', 'Njoftim me WhatsApp', 'Analitika e avancuar', 'Vendosje e veçantë (Featured)', 'Mbështetje prioritare', 'Komision 10%'],
      cta: 'FILLO PRO', href: '/vendor/onboarding',
    },
  ],
  en: [
    {
      name: 'FREE', price: '€0', period: '/ month', highlight: false,
      features: ['Up to 20 products', 'Personal store page', 'Email notifications', 'Basic analytics', 'Flash sales', '12% commission'],
      cta: 'START FREE', href: '/vendor/onboarding',
    },
    {
      name: 'PRO', price: '€15', period: '/ month', highlight: true,
      features: ['Unlimited products', 'WhatsApp notifications', 'Advanced analytics', 'Featured placement', 'Priority support', '10% commission'],
      cta: 'START PRO', href: '/vendor/onboarding',
    },
  ],
  it: [
    {
      name: 'GRATIS', price: '€0', period: '/ mese', highlight: false,
      features: ['Fino a 20 prodotti', 'Pagina negozio personale', 'Notifiche email', 'Analisi base', 'Flash sales', 'Commissione 12%'],
      cta: 'INIZIA GRATIS', href: '/vendor/onboarding',
    },
    {
      name: 'PRO', price: '€15', period: '/ mese', highlight: true,
      features: ['Prodotti illimitati', 'Notifiche WhatsApp', 'Analisi avanzata', 'Posizionamento in evidenza', 'Supporto prioritario', 'Commissione 10%'],
      cta: 'INIZIA PRO', href: '/vendor/onboarding',
    },
  ],
}

const FAQS: Record<Locale, Faq[]> = {
  sq: [
    { q: 'Sa kohë zgjat aprovimi i dyqanit?', a: 'Zakonisht brenda 24 orësh. Do të merrni email me konfirmimin.' },
    { q: 'Si paguhem për shitjet?', a: 'Pagesën e merr direkt nga klienti (cash me dorëzim). Komisioni i 12% zbritet nga shuma dhe llogaritet çdo muaj.' },
    { q: 'Mund të ndryshoj planin më vonë?', a: 'Po, mund të upgradoni në Pro në çdo kohë nga paneli i shitësit.' },
    { q: 'Çfarë ndodh kur mbaroj limitin e 20 produkteve?', a: 'Sistemi nuk lejon shtimin e produkteve të reja derisa të upgradoni ose të fshini produkte ekzistuese.' },
    { q: 'A mund të veprojë dyqani pa foto produkti?', a: 'Teknish po, por rekomandojmë fotografi të qarta — dyqanet me foto shesin 5x më shumë.' },
  ],
  en: [
    { q: 'How long does store approval take?', a: 'Usually within 24 hours. You will receive a confirmation email.' },
    { q: 'How do I get paid for sales?', a: 'Payment is collected directly from the customer (cash on delivery). The 12% commission is deducted from the amount and calculated monthly.' },
    { q: 'Can I change my plan later?', a: 'Yes, you can upgrade to Pro at any time from your seller dashboard.' },
    { q: 'What happens when I reach the 20-product limit?', a: 'The system will not allow adding new products until you upgrade or delete existing ones.' },
    { q: 'Can my store work without product photos?', a: 'Technically yes, but we recommend clear photos — stores with photos sell 5x more.' },
  ],
  it: [
    { q: "Quanto tempo richiede l'approvazione del negozio?", a: 'Di solito entro 24 ore. Riceverai un email di conferma.' },
    { q: 'Come ricevo il pagamento per le vendite?', a: 'Il pagamento viene incassato direttamente dal cliente (contanti alla consegna). La commissione del 12% viene detratta e calcolata mensilmente.' },
    { q: 'Posso cambiare piano in seguito?', a: 'Sì, puoi passare a Pro in qualsiasi momento dal tuo pannello venditore.' },
    { q: 'Cosa succede quando raggiungo il limite di 20 prodotti?', a: "Il sistema non consentirà l'aggiunta di nuovi prodotti finché non effettui un upgrade o elimini quelli esistenti." },
    { q: 'Il mio negozio può funzionare senza foto dei prodotti?', a: 'Tecnicamente sì, ma raccomandiamo foto chiare — i negozi con foto vendono 5 volte di più.' },
  ],
}

export default async function SellPage() {
  const [stats, t, locale] = await Promise.all([getStats(), getT(), getLocale()])

  const steps = STEPS[locale]
  const benefits = BENEFITS[locale]
  const plans = PLANS[locale]
  const faqs = FAQS[locale]

  return (
    <SiteLayout>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #232F3E 0%, #2d3d50 55%, #e5e7eb 100%)',
        padding: '80px 40px 72px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(12,35,64,0.3) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
            {t('sell.platform_label')}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 60px)',
            fontWeight: 900, letterSpacing: '0.06em', color: '#fff',
            lineHeight: 1.05, marginBottom: 20, whiteSpace: 'pre-line',
          }}>
            {t('sell.hero_title')}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            {t('sell.hero_sub')}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/vendor/onboarding" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', padding: '14px 36px', background: '#ffffff', color: '#232F3E', borderRadius: 8, textDecoration: 'none' }}>
              {t('sell.hero_cta')}
            </Link>
            <Link href="/stores" style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', padding: '14px 36px', border: '1.5px solid rgba(255,255,255,0.6)', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>
              {t('sell.hero_browse')}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'var(--black)', padding: '20px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap' }}>
          {[
            { value: `${stats.vendors}+`, label: t('sell.stat_active_stores') },
            { value: `${stats.products}+`, label: t('sell.stat_products') },
            { value: '12%', label: t('sell.stat_commission') },
            { value: '24h', label: t('sell.stat_approval') },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-inner" style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Benefits */}
        <div style={{ paddingTop: 72, paddingBottom: 64 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent)', marginBottom: 8, textAlign: 'center' }}>{t('sell.why_label')}</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 48 }}>
            {t('sell.benefits_title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {benefits.map((b) => (
              <div key={b.title} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 20px' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', marginBottom: 8, color: 'var(--black)' }}>
                  {b.title.toUpperCase()}
                </p>
                <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ paddingBottom: 72, borderTop: '1px solid var(--border)', paddingTop: 64 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent)', marginBottom: 8, textAlign: 'center' }}>{t('sell.process_label')}</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 48 }}>
            {t('sell.how_title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
            {steps.map((step) => (
              <div key={step.num}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, color: 'var(--border)', lineHeight: 1, marginBottom: 16 }}>
                  {step.num}
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 10, color: 'var(--black)' }}>
                  {step.title.toUpperCase()}
                </p>
                <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commission */}
        <div style={{ background: 'var(--gray-light)', borderRadius: 16, padding: '40px 36px', marginBottom: 72, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent)', marginBottom: 8 }}>{t('sell.commission_label')}</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.06em', marginBottom: 16, color: 'var(--black)' }}>
              {t('sell.commission_title')}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.8, marginBottom: 16 }}>
              {t('sell.commission_desc1')}
            </p>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.8 }}>
              {t('sell.commission_desc2')}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: t('sell.commission_row1'), value: '€100.00', color: 'var(--black)' },
              { label: t('sell.commission_row2'), value: '− €12.00', color: '#ef4444' },
              { label: t('sell.commission_row3'), value: '€88.00', color: 'var(--accent-dark)', big: true },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: row.big ? 12 : 11, fontWeight: row.big ? 800 : 600, letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>
                  {row.label}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: row.big ? 20 : 14, fontWeight: 800, color: row.color }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ paddingBottom: 72 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent)', marginBottom: 8, textAlign: 'center' }}>{t('sell.plans_label')}</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 48 }}>
            {t('sell.plans_title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 640, margin: '0 auto' }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlight ? 'var(--black)' : 'var(--white)',
                  border: `2px solid ${plan.highlight ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 16, padding: '32px 28px',
                  position: 'relative',
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: '#ffffff', fontFamily: 'var(--font-display)',
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '4px 14px', borderRadius: 20,
                  }}>
                    {t('sell.plan_popular')}
                  </div>
                )}
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: plan.highlight ? 'var(--accent)' : 'var(--gray-mid)', marginBottom: 8 }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: plan.highlight ? '#fff' : 'var(--black)' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.5)' : 'var(--gray-mid)' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.8)' : 'var(--gray-dark)' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  style={{
                    display: 'block', textAlign: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                    padding: '13px 24px', borderRadius: 8, textDecoration: 'none',
                    background: plan.highlight ? 'var(--accent)' : 'transparent',
                    color: plan.highlight ? '#ffffff' : 'var(--black)',
                    border: plan.highlight ? 'none' : '1.5px solid var(--black)',
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ paddingBottom: 72, borderTop: '1px solid var(--border)', paddingTop: 64 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent)', marginBottom: 8, textAlign: 'center' }}>{t('sell.faq_label')}</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 48 }}>
            {t('sell.faq_title')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, margin: '0 auto' }}>
            {faqs.map((item) => (
              <div key={item.q} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', marginBottom: 8, color: 'var(--black)' }}>
                  {item.q}
                </p>
                <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.7 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background: 'linear-gradient(135deg, #232F3E 0%, #2d3d50 100%)', borderRadius: 16, padding: '52px 40px', textAlign: 'center', marginBottom: 72 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, letterSpacing: '0.08em', color: '#fff', marginBottom: 16 }}>
            {t('sell.cta_title')}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            {t('sell.cta_sub')}
          </p>
          <Link
            href="/vendor/onboarding"
            style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', padding: '16px 44px', background: '#ffffff', color: '#232F3E', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}
          >
            {t('sell.cta_btn')}
          </Link>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>
            {t('sell.cta_note')}
          </p>
        </div>

      </div>
    </SiteLayout>
  )
}
