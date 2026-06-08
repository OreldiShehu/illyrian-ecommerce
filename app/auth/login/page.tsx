'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'

const clean = (s: string) =>
  Array.from(s).filter(c => {
    const n = c.charCodeAt(0)
    return n !== 0xFEFF && n !== 0x200B && n !== 0x200C && n !== 0x200D && n !== 0x00AD && n !== 0x2060
  }).join('').trim()

function LoginForm() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') ?? '/'

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({ email: '', password: '' })
  const { t } = useLanguage()

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: clean(fields.email),
        password: clean(fields.password),
      })

      if (authError) {
        setError(
          authError.message.includes('Invalid login')
            ? t('auth.invalid_login')
            : authError.message
        )
        setLoading(false)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = userData?.role ?? 'customer'
      let vendorStatus: string | undefined

      if (role === 'vendor') {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('status')
          .eq('user_id', data.user.id)
          .single()
        vendorStatus = vendorData?.status
      }

      if (role === 'admin') {
        window.location.href = '/admin'
      } else if (role === 'vendor' && vendorStatus === undefined) {
        window.location.href = '/vendor/onboarding'
      } else if (role === 'vendor') {
        window.location.href = '/vendor/dashboard'
      } else {
        window.location.href = returnUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ndodhi një gabim. Provoni përsëri.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-main">MIO E-COMMERCE</span>
          <span className="auth-logo-sub">DISCOVER &middot; COMPARE &middot; ORDER</span>
        </div>

        <h1 className="auth-title">{t('auth.login_title')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="email@shembull.com"
              required
              autoComplete="email"
              value={fields.email}
              onChange={set('email')}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={fields.password}
              onChange={set('password')}
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('auth.logging_in') : t('auth.login_btn')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 8 }}>
            {t('auth.no_account')}
          </p>
          <Link
            href="/auth/register"
            style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}
          >
            {t('auth.register_link')}
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
