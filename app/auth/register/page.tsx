'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'

const clean = (s: string) =>
  Array.from(s).filter(c => {
    const n = c.charCodeAt(0)
    return n !== 0xFEFF && n !== 0x200B && n !== 0x200C && n !== 0x200D && n !== 0x00AD && n !== 0x2060
  }).join('').trim()

export default function RegisterPage() {
  const [role, setRole] = useState<'customer' | 'vendor'>('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const { t } = useLanguage()

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError('')
    setLoading(true)

    const name = clean(fields.name)
    const email = clean(fields.email)
    const phone = clean(fields.phone)
    const password = clean(fields.password)
    const confirmPassword = clean(fields.confirmPassword)

    if (!name || !email || !password) {
      setError(t('auth.required'))
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch'))
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError(t('auth.password_short'))
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      // Clear any corrupted existing session from storage (no network call)
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, role } },
      })

      if (authError) {
        setError(
          authError.message.includes('already registered')
            ? t('auth.already_registered')
            : authError.message
        )
        setLoading(false)
        return
      }

      if (!data.user) {
        setError(t('auth.required'))
        setLoading(false)
        return
      }

      if (data.session) {
        // Email confirmation disabled — session ready, redirect immediately
        window.location.href = role === 'vendor' ? '/vendor/onboarding' : '/'
        return
      }

      // Email confirmation required — try signing in anyway
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInError) {
        window.location.href = role === 'vendor' ? '/vendor/onboarding' : '/'
        return
      }

      // Email not confirmed yet — show message instead of broken redirect
      setLoading(false)
      setError(t('auth.confirm_email'))
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
        <h1 className="auth-title">{t('auth.register_title')}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          <button type="button" onClick={() => setRole('customer')} style={btnStyle(role === 'customer')}>
            {t('auth.as_customer')}
          </button>
          <button type="button" onClick={() => setRole('vendor')} style={btnStyle(role === 'vendor')}>
            {t('auth.as_vendor')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.fullname')}</label>
            <input
              type="text" className="form-input" placeholder="Emri Mbiemri"
              required autoComplete="off" value={fields.name} onChange={set('name')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input
              type="email" className="form-input" placeholder="email@shembull.com"
              required autoComplete="off" value={fields.email} onChange={set('email')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.phone')}</label>
            <input
              type="tel" className="form-input" placeholder="+355 6X XXX XXXX"
              autoComplete="off" value={fields.phone} onChange={set('phone')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              type="password" className="form-input" placeholder="Minimum 8 karaktere"
              required minLength={8} autoComplete="new-password"
              value={fields.password} onChange={set('password')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.confirm_password')}</label>
            <input
              type="password" className="form-input" placeholder="Ri-shkruaj fjal&euml;kalimin"
              required autoComplete="new-password"
              value={fields.confirmPassword} onChange={set('confirmPassword')}
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

          {role === 'vendor' && (
            <div style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: 'var(--gray-dark)', lineHeight: 1.6 }}>
              {t('auth.vendor_note')}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('auth.registering') : role === 'vendor' ? t('auth.open_store_btn') : t('auth.register_btn')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-dark)', marginBottom: 8 }}>{t('auth.have_account')}</p>
          <Link href="/auth/login" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--black)', borderBottom: '1px solid var(--black)' }}>
            {t('auth.login_link')}
          </Link>
        </div>
      </div>
    </div>
  )
}
