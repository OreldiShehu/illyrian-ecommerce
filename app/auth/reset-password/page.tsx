'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError(t('auth.invalid_reset'))
      setVerifying(false)
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) setError(t('auth.invalid_reset'))
      setVerifying(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError(t('auth.password_mismatch'))
      return
    }
    if (password.length < 8) {
      setError(t('auth.password_short'))
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => { window.location.href = '/' }, 2000)
  }

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--gray-dark)' }}>{t('common.loading') ?? 'Duke verifikuar...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-main">MIO E-COMMERCE</span>
          <span className="auth-logo-sub">DISCOVER &middot; COMPARE &middot; ORDER</span>
        </div>

        <h1 className="auth-title">{t('auth.new_password_title')}</h1>

        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>✓</div>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.6 }}>
              {t('auth.password_updated')}
            </p>
          </div>
        ) : error && !password ? (
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <p className="form-error" style={{ marginBottom: 20 }}>{error}</p>
            <Link href="/auth/forgot-password" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}>
              {t('auth.send_reset')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.new_password')}</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 8 karaktere"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.confirm_password')}</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ri-shkruaj fjalëkalimin"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('auth.updating') : t('auth.update_password')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="auth-card" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
