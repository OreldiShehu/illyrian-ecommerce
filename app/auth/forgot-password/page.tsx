'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-main">MIO E-COMMERCE</span>
          <span className="auth-logo-sub">DISCOVER &middot; COMPARE &middot; ORDER</span>
        </div>

        <h1 className="auth-title">{t('auth.forgot_password_title')}</h1>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>✓</div>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', lineHeight: 1.6, marginBottom: 24 }}>
              {t('auth.reset_sent')}
            </p>
            <Link href="/auth/login" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}>
              {t('auth.back_to_login')}
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 24, lineHeight: 1.6 }}>
              {t('auth.forgot_password_desc')}
            </p>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('auth.sending') : t('auth.send_reset')}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link href="/auth/login" style={{ fontSize: 12, color: 'var(--gray-mid)', textDecoration: 'underline' }}>
                {t('auth.back_to_login')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
