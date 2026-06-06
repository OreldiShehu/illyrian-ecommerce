'use client'

import { useState, useActionState } from 'react'
import { subscribeNewsletter } from '@/app/actions/newsletter'

export default function NewsletterSection() {
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
      setMessage(result.error ?? 'Gabim.')
      setTimeout(() => { setStatus('idle'); setMessage('') }, 3000)
    }
  }

  return (
    <section className="newsletter-section">
      <h3 className="nl-title">BASHKOHU ME ZAZA&apos;S</h3>
      <p className="nl-sub">Merr njoftime për dyqane të reja, oferta ekskluzive dhe aksesoret javore</p>
      <form className="nl-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email-i juaj"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={status === 'success' ? { background: '#C9A84C', color: '#000' } : undefined}
        >
          {status === 'loading' ? 'DUKE DËRGUAR…' : status === 'success' ? message : status === 'error' ? message : 'SUBSCRIBE'}
        </button>
      </form>
    </section>
  )
}
