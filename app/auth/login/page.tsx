'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { signIn } from '@/app/actions/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') ?? '/'

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)

    if (!result.success) {
      setError(result.error ?? 'Hyrja dështoi.')
      setLoading(false)
      return
    }

    const { role, vendorStatus } = result.data!

    if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'vendor' && vendorStatus === undefined) {
      router.push('/vendor/onboarding')
    } else if (role === 'vendor') {
      router.push('/vendor/dashboard')
    } else {
      router.push(returnUrl)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-main">ZAZA&apos;S E-COMMERCE</span>
          <span className="auth-logo-sub">DISCOVER · COMPARE · ORDER</span>
        </div>

        <h1 className="auth-title">KYÇU</h1>

        <form onSubmit={handleSubmit}>
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
            <label className="form-label" htmlFor="password">Fjalëkalimi</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'DUKE HYRË…' : 'KYÇU'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 8 }}>
            Nuk keni llogari?
          </p>
          <Link
            href="/auth/register"
            style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}
          >
            REGJISTROHU
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="auth-card" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
