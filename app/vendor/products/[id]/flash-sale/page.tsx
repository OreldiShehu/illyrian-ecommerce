'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createFlashSale } from '@/app/actions/vendor'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export default function FlashSalePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    discount_percentage: '20',
    duration_hours: '2',
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single()
      setProduct(data as Product | null)
      setLoading(false)
    }
    load()
  }, [productId])

  const discountPct = parseFloat(form.discount_percentage) || 0
  const flashPrice = product ? product.price * (1 - discountPct / 100) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const fd = new FormData()
    fd.append('product_id', productId)
    fd.append('discount_percentage', form.discount_percentage)
    fd.append('duration_hours', form.duration_hours)
    const result = await createFlashSale(fd)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error ?? 'Gabim. Provoni përsëri.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8 }} />
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: '#dc2626' }}>Produkti nuk u gjet.</p>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: 32, maxWidth: 480 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 12, color: '#15803d' }}>FLASH SALE U KRIJUA!</p>
          <p style={{ fontSize: 13, color: '#166534', marginBottom: 20 }}>
            Flash sale-i për <strong>{product.name}</strong> është aktiv tani.
          </p>
          <button onClick={() => router.push('/vendor/products')} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
            ← KTHEHU TE PRODUKTET
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => router.back()} style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-dark)', marginBottom: 24, padding: 0 }}>
        ← KTHEHU
      </button>

      <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>PROMOVIME</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 32 }}>KRIJO FLASH SALE</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, maxWidth: 800 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 6 }}>{product.name}</h2>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 24, color: 'var(--gray-dark)' }}>{formatPrice(product.price)}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Zbritja (%)</label>
              <input
                type="number"
                min="15"
                max="90"
                step="1"
                className="form-input"
                value={form.discount_percentage}
                onChange={(e) => setForm((f) => ({ ...f, discount_percentage: e.target.value }))}
                required
              />
              <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4 }}>Minimumi: 15%. Maximumi: 90%.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Kohëzgjatja (orë)</label>
              <input
                type="number"
                min="1"
                max="4"
                step="1"
                className="form-input"
                value={form.duration_hours}
                onChange={(e) => setForm((f) => ({ ...f, duration_hours: e.target.value }))}
                required
              />
              <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 4 }}>Maximumi: 4 orë. Flash sale-i mbyllet automatikisht.</p>
            </div>

            {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

            <button type="submit" disabled={submitting} style={{ background: '#C9A84C', color: 'var(--white)', border: 'none', borderRadius: 6, padding: '12px 28px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', cursor: submitting ? 'not-allowed' : 'pointer', width: '100%', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'DUKE KRIJUAR…' : 'AKTIVIZO FLASH SALE'}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div style={{ background: 'var(--black)', borderRadius: 10, padding: 28, color: 'var(--white)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>PAMJA PARAPRAKE</p>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 8 }}>ÇMIMI I FLASH SALE</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{formatPrice(flashPrice)}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginTop: 4 }}>{formatPrice(product.price)}</p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>DETAJET</p>
            {[
              { label: 'Zbritja', value: `${discountPct}%` },
              { label: 'Çmimi origjinal', value: formatPrice(product.price) },
              { label: 'Çmimi flash', value: formatPrice(flashPrice) },
              { label: 'Kursimet', value: formatPrice(product.price - flashPrice) },
              { label: 'Kohëzgjatja', value: `${form.duration_hours} orë` },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(201,168,76,0.15)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)' }}>
            <p style={{ fontSize: 11, color: '#C9A84C', lineHeight: 1.6 }}>
              Flash sale-i do të shfaqet në faqen kryesore dhe në faqen e dyqanit tuaj si prioritet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
