'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signUp } from '@/app/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'vendor'>('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('role', role)

      const result = await signUp(formData)

      if (!result.success) {
        setError(result.error ?? 'Regjistrimi dështoi.')
        setLoading(false)
        return
      }

      if (role === 'vendor') {
        router.push('/vendor/onboarding')
      } else {
        router.push('/')
      }
    } catch {
      setError('Ndodhi një gabim. Provoni përsëri.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <span className="auth-logo-main">ZAZA&apos;S E-COMMERCE</span>
          <span className="auth-logo-sub">DISCOVER · COMPARE · ORDER</span>
        </div>

        <h1 className="auth-title">REGJISTROHU</h1>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setRole('customer')}
            style={{
              padding: '12px 8px',
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              border: `2px solid ${role === 'customer' ? 'var(--black)' : 'var(--border)'}`,
              background: role === 'customer' ? 'var(--black)' : 'transparent',
              color: role === 'customer' ? 'var(--white)' : 'var(--black)',
              cursor: 'pointer',
              borderRadius: 6,
              transition: 'all 0.2s',
            }}
          >
            BLI SI KLIENT
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            style={{
              padding: '12px 8px',
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              border: `2px solid ${role === 'vendor' ? 'var(--black)' : 'var(--border)'}`,
              background: role === 'vendor' ? 'var(--black)' : 'transparent',
              color: role === 'vendor' ? 'var(--white)' : 'var(--black)',
              cursor: 'pointer',
              borderRadius: 6,
              transition: 'all 0.2s',
            }}
          >
            HAP DYQANIN TËnd
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Emri i plotë</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Emri Mbiemri"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="email@shembull.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Numri i telefonit</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-input"
              placeholder="+355 6X XXX XXXX"
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Fjalëkalimi</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Minimum 8 karaktere"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Konfirmo fjalëkalimin</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Ri-shkruaj fjalëkalimin"
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

          {role === 'vendor' && (
            <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: 'var(--gray-dark)', lineHeight: 1.6 }}>
              💡 Pas regjistrimit do të plotësoni detajet e dyqanit tuaj. Aplikimi rishikohet brenda 24 orësh.
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'DUKE REGJISTRUAR…' : role === 'vendor' ? 'HAP DYQANIN' : 'REGJISTROHU'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 8 }}>
            Keni tashmë llogari?
          </p>
          <Link
            href="/auth/login"
            style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}
          >
            KYÇU
          </Link>
        </div>
      </div>
    </div>
  )
}
