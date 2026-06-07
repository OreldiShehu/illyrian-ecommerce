'use client'

import { useState } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'

export default function ContactPage() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <SiteLayout>
      <div className="page-container">
        <div className="page-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 60, alignItems: 'start' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 8 }}>MBËSHTETJA</p>
              <h1 className="page-title">NA KONTAKTO</h1>
              <p style={{ fontSize: 14, color: 'var(--gray-dark)', lineHeight: 1.8, marginBottom: 40 }}>
                Jemi këtu për t&apos;ju ndihmuar. Dërgoni një mesazh dhe do t&apos;ju përgjigjemi brenda 24 orësh.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'EMAIL', value: 'info@mio-ecommerce.al', href: 'mailto:info@mio-ecommerce.al' },
                  { label: 'INSTAGRAM', value: '@mio.ecommerce', href: 'https://instagram.com' },
                  { label: 'WHATSAPP', value: '+355 69 XXX XXXX', href: 'https://wa.me/355' },
                ].map((c) => (
                  <div key={c.label}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gray-mid)', marginBottom: 4 }}>{c.label}</p>
                    <a href={c.href} style={{ fontSize: 14, color: 'var(--black)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--black)' }}>
                      {c.value}
                    </a>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 48, padding: '20px 24px', background: 'var(--off-white)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>JE SHITËS?</p>
                <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.7, marginBottom: 12 }}>
                  Për çështje specifike të dyqanit tuaj, hyni në panelin e shitësit ose na dërgoni email me ID e shitësit.
                </p>
                <a href="/vendor/dashboard" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}>
                  PANELI I SHITËSIT →
                </a>
              </div>
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '32px 28px' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, marginBottom: 12 }}>FALEMINDERIT!</p>
                  <p style={{ fontSize: 14, color: 'var(--gray-dark)', lineHeight: 1.7 }}>
                    Mesazhi juaj u dërgua. Do t&apos;ju përgjigjemi brenda 24 orësh.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 24 }}>DËRGONI MESAZH</p>

                  <div className="form-group">
                    <label className="form-label">Emri</label>
                    <input type="text" className="form-input" required value={fields.name} onChange={set('name')} placeholder="Emri juaj" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" required value={fields.email} onChange={set('email')} placeholder="email@shembull.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subjekti</label>
                    <select className="form-select" style={{ width: '100%' }} value={fields.subject} onChange={set('subject')} required>
                      <option value="">Zgjidhni temën…</option>
                      <option value="order">Çështje me porosinë</option>
                      <option value="return">Kthim produkti</option>
                      <option value="vendor">Regjistrim shitësi</option>
                      <option value="technical">Problem teknik</option>
                      <option value="other">Tjetër</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mesazhi</label>
                    <textarea
                      className="form-input"
                      required
                      rows={5}
                      value={fields.message}
                      onChange={set('message')}
                      placeholder="Shkruani mesazhin tuaj këtu…"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'DUKE DËRGUAR…' : 'DËRGO MESAZHIN'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
