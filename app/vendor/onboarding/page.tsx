'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/app/actions/vendor'
import { slugify } from '@/lib/utils'
import { ALBANIAN_CITIES, VENDOR_CATEGORIES } from '@/types'

export default function VendorOnboardingPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    store_name: '',
    slug: '',
    city: ALBANIAN_CITIES[0],
    category: VENDOR_CATEGORIES[0],
    bio: '',
    logo_url: '',
    banner_url: '',
    whatsapp: '',
    bank_name: '',
    iban: '',
    account_holder: '',
    plan: 'free',
  })

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleStoreNameChange = (val: string) => {
    setFormData((prev) => ({ ...prev, store_name: val, slug: slugify(val) }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    const fd = new FormData()
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
    const result = await completeOnboarding(fd)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error ?? 'Gabim. Provoni përsëri.')
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 12 }}>APLIKIMI U DËRGUA!</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-dark)', lineHeight: 1.7 }}>
            Ekipi ynë do të rishikojë dyqanin tuaj brenda 24 orësh. Do të merrni email me vendimin.
          </p>
        </div>
      </div>
    )
  }

  const TOTAL_STEPS = 4
  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 8 }}>MIO E-COMMERCE</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, letterSpacing: '0.08em' }}>HAP DYQANIN TËnd</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginTop: 8 }}>Hapi {step} nga {TOTAL_STEPS}</p>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--gray-light)', borderRadius: 4, height: 4, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--black)', transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 40 }}>
          {/* Step 1: Store Identity */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 24 }}>IDENTITETI I DYQANIT</h2>
              <div className="form-group">
                <label className="form-label">Emri i dyqanit *</label>
                <input type="text" className="form-input" value={formData.store_name} onChange={(e) => handleStoreNameChange(e.target.value)} placeholder="p.sh. Fashion Albania" />
              </div>
              <div className="form-group">
                <label className="form-label">Slug (URL) *</label>
                <input type="text" className="form-input" value={formData.slug} onChange={(e) => updateField('slug', slugify(e.target.value))} placeholder="fashion-albania" />
                <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4 }}>
                  URL: mio-ecommerce.al/stores/{formData.slug || '…'}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Qyteti *</label>
                  <select className="form-select" value={formData.city} onChange={(e) => updateField('city', e.target.value)}>
                    {ALBANIAN_CITIES.filter((c) => c !== 'Tjetër').map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kategoria *</label>
                  <select className="form-select" value={formData.category} onChange={(e) => updateField('category', e.target.value)}>
                    {[...VENDOR_CATEGORIES].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio / Përshkrimi</label>
                <textarea className="form-textarea" value={formData.bio} onChange={(e) => updateField('bio', e.target.value)} placeholder="Tregoni pak për dyqanin tuaj…" rows={4} />
              </div>
            </div>
          )}

          {/* Step 2: Visuals */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8 }}>IMAZHET E DYQANIT</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 24, lineHeight: 1.6 }}>
                Shtoni URL-të e imazheve nga Cloudinary, Google Drive ose çdo host tjetër. Ekipi ynë do t&apos;i ngarkojë gjatë aprovimit.
              </p>
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input type="url" className="form-input" value={formData.logo_url} onChange={(e) => updateField('logo_url', e.target.value)} placeholder="https://…" />
                <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4 }}>Rekomandohet: imazh katror 200×200px</p>
              </div>
              <div className="form-group">
                <label className="form-label">Banner URL</label>
                <input type="url" className="form-input" value={formData.banner_url} onChange={(e) => updateField('banner_url', e.target.value)} placeholder="https://…" />
                <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4 }}>Rekomandohet: imazh 1200×400px</p>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Banking */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 24 }}>KONTAKT & BANKA</h2>
              <div className="form-group">
                <label className="form-label">Numri WhatsApp</label>
                <input type="tel" className="form-input" value={formData.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="+355 6X XXX XXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Emri i bankës</label>
                <input type="text" className="form-input" value={formData.bank_name} onChange={(e) => updateField('bank_name', e.target.value)} placeholder="p.sh. Raiffeisen Bank" />
              </div>
              <div className="form-group">
                <label className="form-label">IBAN</label>
                <input type="text" className="form-input" value={formData.iban} onChange={(e) => updateField('iban', e.target.value)} placeholder="AL…" />
              </div>
              <div className="form-group">
                <label className="form-label">Titullari i llogarisë</label>
                <input type="text" className="form-input" value={formData.account_holder} onChange={(e) => updateField('account_holder', e.target.value)} placeholder="Emri Mbiemri" />
              </div>
            </div>
          )}

          {/* Step 4: Plan */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 24 }}>ZGJIDHNI PLANIN</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  {
                    key: 'free',
                    name: 'FALAS',
                    price: '€0/muaj',
                    features: ['Deri 20 produkte', 'Analitika bazike', 'Pagesë me dorëzim'],
                  },
                  {
                    key: 'pro',
                    name: 'PRO',
                    price: '€29/muaj',
                    features: ['Produkte të pakufizuara', 'Analitika e plotë', 'Flash sale', 'Mbështetje prioritare', 'Listim i veçuar'],
                  },
                ].map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => updateField('plan', plan.key)}
                    style={{
                      padding: 20,
                      border: `2px solid ${formData.plan === plan.key ? 'var(--black)' : 'var(--border)'}`,
                      borderRadius: 10,
                      background: formData.plan === plan.key ? 'var(--black)' : 'transparent',
                      color: formData.plan === plan.key ? 'var(--white)' : 'var(--black)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 4 }}>{plan.name}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12, color: formData.plan === plan.key ? '#C9A84C' : 'var(--gray-dark)' }}>{plan.price}</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {plan.features.map((f) => (
                        <li key={f} style={{ fontSize: 12, marginBottom: 4, color: formData.plan === plan.key ? 'rgba(255,255,255,0.8)' : 'var(--gray-dark)' }}>
                          ✓ {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-dark)', lineHeight: 1.6 }}>
                * Pagesa për planin Pro mblidhet manualisht nga ekipi ynë pas aprovimit.<br />
                Komisioni standard: 12% për çdo shitje.
              </p>
            </div>
          )}

          {error && <p className="form-error" style={{ marginTop: 16 }}>{error}</p>}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary">
                ← KTHEHU
              </button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!formData.store_name || !formData.slug)) {
                    setError('Emri dhe slug-u janë të detyrueshme.')
                    return
                  }
                  setError('')
                  setStep((s) => s + 1)
                }}
                className="btn-primary"
                style={{ width: 'auto', padding: '12px 28px' }}
              >
                VAZHDO →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary"
                style={{ width: 'auto', padding: '12px 28px' }}
              >
                {submitting ? 'DUKE DËRGUAR…' : 'DËRGO APLIKIMIN'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
