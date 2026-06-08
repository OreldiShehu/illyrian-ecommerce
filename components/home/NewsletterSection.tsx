'use client'

import { useState } from 'react'
import { subscribeNewsletter } from '@/app/actions/newsletter'
import { useLanguage } from '@/lib/i18n'

export default function NewsletterSection() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const result = await subscribeNewsletter(email)

    if (result.success) {
      setStatus('success')
      setMessage('SUBSCRIBED ✓')
      setEmail('')
      setTimeout(() => { setStatus('idle'); setMessage('') }, 3000)
    } else {
      setStatus('error')
      setMessage(result.error ?? 'Error.')
      setTimeout(() => { setStatus('idle'); setMessage('') }, 3000)
    }
  }

  return (
    <section className="newsletter-section">
      <h3 className="nl-title">{t('nl.title')}</h3>
      <p className="nl-sub">{t('nl.sub')}</p>
      <form className="nl-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={t('nl.placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={status === 'success' ? { background: '#232F3E', color: '#fff' } : undefined}
        >
          {status === 'loading' ? t('nl.sending') : status === 'success' ? message : status === 'error' ? message : t('nl.btn')}
        </button>
      </form>
    </section>
  )
}
