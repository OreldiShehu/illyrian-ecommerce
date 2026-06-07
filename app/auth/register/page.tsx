'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signUp } from '@/app/actions/auth'

const clean = (s: string) =>
  Array.from(s).filter(c => {
    const n = c.charCodeAt(0)
    return n !== 0xFEFF && n !== 0x200B && n !== 0x200C && n !== 0x200D && n !== 0x00AD && n !== 0x2060
  }).join('').trim()

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'vendor'>('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signUp({
        name: clean(fields.name),
        email: clean(fields.email),
        phone: clean(fields.phone),
        password: fields.password,
        confirmPassword: fields.confirmPassword,
        role,
      })
      if (!result.success) {
        setError(result.error ?? 'Regjistrimi deshtoi.')
        setLoading(false)
        return
      }
      router.push(role === 'vendor' ? '/vendor/onboarding' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ndodhi nje gabim. Provoni perseri.')
      setLoading(false)
    }
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 8px',
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    border: `2px solid ${active ? 'var(--black)' : 'var(--border)'}`,
    background: active ? 'var(--black)' : 'transparent',
    color: active ? 'var(--white)' : 'var(--black)',
    cursor: 'pointer',
    borderRadius: 6,
    transition: 'all 0.2s',
  })

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <span className="auth-logo-main">MIO E-COMMERCE</span>
          <span className="auth-logo-sub">DISCOVER &middot; COMPARE &middot; ORDER</span>
        </div>
        <h1 className="auth-title">REGJISTROHU</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          <button type="button" onClick={() => setRole('customer')} style={btnStyle(role === 'customer')}>
            BLI SI KLIENT
          </button>
          <button type="button" onClick={() => setRole('vendor')} style={btnStyle(role === 'vendor')}>
            HAP DYQANIN
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Emri i plot&euml;</label>
            <input
              type="text" className="form-input" placeholder="Emri Mbiemri"
              required autoComplete="off" value={fields.name} onChange={set('name')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email" className="form-input" placeholder="email@shembull.com"
              required autoComplete="off" value={fields.email} onChange={set('email')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Numri i telefonit</label>
            <input
              type="tel" className="form-input" placeholder="+355 6X XXX XXXX"
              autoComplete="off" value={fields.phone} onChange={set('phone')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fjalëkalimi</label>
            <input
              type="password" className="form-input" placeholder="Minimum 8 karaktere"
              required minLength={8} autoComplete="new-password"
              value={fields.password} onChange={set('password')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Konfirmo fjalëkalimin</label>
            <input
              type="password" className="form-input" placeholder="Ri-shkruaj fjalëkalimin"
              required autoComplete="new-password"
              value={fields.confirmPassword} onChange={set('confirmPassword')}
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

          {role === 'vendor' && (
            <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: 'var(--gray-dark)', lineHeight: 1.6 }}>
              Pas regjistrimit do t&euml; plot&euml;soni detajet e dyqanit tuaj. Rishikohet brenda 24 or&euml;sh.
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'DUKE REGJISTRUAR...' : role === 'vendor' ? 'HAP DYQANIN' : 'REGJISTROHU'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 8 }}>Keni tashm&euml; llogari?</p>
          <Link href="/auth/login" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}>
            KY&Ccedil;U
          </Link>
        </div>
      </div>
    </div>
  )
}
