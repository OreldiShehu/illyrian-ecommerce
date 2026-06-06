'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/vendor'
import { formatPrice, slugify } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/types'
import type { Product, Vendor } from '@/types'
import Papa from 'papaparse'

type FormMode = 'create' | 'edit' | null

interface ProductForm {
  name: string
  slug: string
  description: string
  price: string
  compare_price: string
  cost_price: string
  sku: string
  stock: string
  category: string
  sizes: string
  colors: string
  images: string
  is_active: boolean
}

const EMPTY_FORM: ProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compare_price: '',
  cost_price: '',
  sku: '',
  stock: '0',
  category: PRODUCT_CATEGORIES[0],
  sizes: '',
  colors: '',
  images: '',
  is_active: true,
}

export default function VendorProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<FormMode>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [csvUploading, setCsvUploading] = useState(false)
  const csvRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: v } = await supabase.from('vendors').select('*').eq('user_id', user.id).single()
      if (!v) return
      setVendor(v as Vendor)
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', v.id)
        .order('created_at', { ascending: false })
      setProducts((prods ?? []) as Product[])
      setLoading(false)
    }
    load()
  }, [])

  const openCreate = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setMode('create')
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: p.price.toString(),
      compare_price: p.compare_price?.toString() ?? '',
      cost_price: p.cost_price?.toString() ?? '',
      sku: p.sku ?? '',
      stock: p.stock.toString(),
      category: p.category ?? PRODUCT_CATEGORIES[0],
      sizes: (p.sizes ?? []).join(', '),
      colors: (p.colors ?? []).join(', '),
      images: (p.images ?? []).join('\n'),
      is_active: p.is_active,
    })
    setFormError('')
    setMode('edit')
  }

  const closeForm = () => {
    setMode(null)
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const buildFormData = (): FormData => {
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('slug', form.slug || slugify(form.name))
    fd.append('description', form.description)
    fd.append('price', form.price)
    fd.append('compare_price', form.compare_price)
    fd.append('cost_price', form.cost_price)
    fd.append('sku', form.sku)
    fd.append('stock', form.stock)
    fd.append('category', form.category)
    fd.append('sizes', form.sizes)
    fd.append('colors', form.colors)
    fd.append('images', form.images)
    fd.append('is_active', form.is_active ? 'true' : 'false')
    if (editingProduct) fd.append('product_id', editingProduct.id)
    return fd
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    const fd = buildFormData()
    const result = mode === 'edit'
      ? await updateProduct(fd)
      : await createProduct(fd)
    if (result.success) {
      setSuccessMsg(mode === 'edit' ? 'Produkti u përditësua!' : 'Produkti u shtua!')
      closeForm()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && vendor) {
        const { data } = await supabase.from('products').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false })
        setProducts((data ?? []) as Product[])
      }
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setFormError(result.error ?? 'Gabim. Provoni përsëri.')
    }
    setSubmitting(false)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Jeni i sigurt që dëshironi ta fshini këtë produkt?')) return
    const fd = new FormData()
    fd.append('product_id', productId)
    const result = await deleteProduct(fd)
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    }
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !vendor) return
    setCsvUploading(true)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let count = 0
        for (const row of results.data) {
          const fd = new FormData()
          fd.append('name', row.name ?? '')
          fd.append('slug', slugify(row.name ?? ''))
          fd.append('description', row.description ?? '')
          fd.append('price', row.price ?? '0')
          fd.append('compare_price', row.compare_price ?? '')
          fd.append('cost_price', row.cost_price ?? '')
          fd.append('sku', row.sku ?? '')
          fd.append('stock', row.stock ?? '0')
          fd.append('category', row.category ?? PRODUCT_CATEGORIES[0])
          fd.append('sizes', row.sizes ?? '')
          fd.append('colors', row.colors ?? '')
          fd.append('images', row.images ?? '')
          fd.append('is_active', 'true')
          const result = await createProduct(fd)
          if (result.success) count++
        }
        const { data } = await supabase.from('products').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false })
        setProducts((data ?? []) as Product[])
        setSuccessMsg(`${count} produkte u ngarkuan nga CSV!`)
        setTimeout(() => setSuccessMsg(''), 4000)
        setCsvUploading(false)
        if (csvRef.current) csvRef.current.value = ''
      },
    })
  }

  const isFreeOverLimit = vendor && (vendor as any).plan === 'free' && products.length >= 20

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 20, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginBottom: 4 }}>MENAXHIMI</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em' }}>PRODUKTET ({products.length})</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ cursor: csvUploading || isFreeOverLimit ? 'not-allowed' : 'pointer', opacity: csvUploading ? 0.6 : 1 }}>
            <input
              ref={csvRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleCsvUpload}
              disabled={csvUploading || !!isFreeOverLimit}
            />
            <span className="btn-secondary" style={{ pointerEvents: 'none', padding: '10px 20px', display: 'inline-block' }}>
              {csvUploading ? 'DUKE NGARKUAR…' : '↑ NGARKO CSV'}
            </span>
          </label>
          <button
            onClick={openCreate}
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            disabled={!!isFreeOverLimit}
            title={isFreeOverLimit ? 'Plani falas lejon deri 20 produkte' : undefined}
          >
            + PRODUKT I RI
          </button>
        </div>
      </div>

      {isFreeOverLimit && (
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
          Keni arritur limitin e 20 produkteve të planit falas.{' '}
          <strong>Kaloni te Pro</strong> për produkte të pakufizuara.
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Product table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {products.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--gray-dark)', marginBottom: 16 }}>Nuk keni shtuar ende produkte.</p>
            <button onClick={openCreate} className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>SHTO PRODUKTIN E PARË</button>
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 56 }}>IMG</th>
                <th>EMRI</th>
                <th>ÇMIMI</th>
                <th>STOKU</th>
                <th>KATEGORIA</th>
                <th>STATUSI</th>
                <th style={{ width: 140 }}>VEPRIMET</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ width: 44, height: 44, borderRadius: 6, background: '#252525', position: 'relative', overflow: 'hidden' }}>
                      {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" sizes="44px" />}
                    </div>
                  </td>
                  <td>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{p.sku || '—'}</p>
                  </td>
                  <td>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>{formatPrice(p.price)}</p>
                    {p.compare_price && p.compare_price > p.price && (
                      <p style={{ fontSize: 11, color: 'var(--gray-mid)', textDecoration: 'line-through' }}>{formatPrice(p.compare_price)}</p>
                    )}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: p.stock === 0 ? '#dc2626' : p.stock <= 5 ? '#d97706' : '#16a34a',
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-dark)' }}>{p.category}</td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: p.is_active ? '#f0fdf4' : '#fef2f2',
                      color: p.is_active ? '#16a34a' : '#dc2626',
                    }}>
                      {p.is_active ? 'AKTIV' : 'JOAKTIV'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>EDITO</button>
                      <Link href={`/vendor/products/${p.id}/flash-sale`} style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid #C9A84C', borderRadius: 4, padding: '4px 10px', textDecoration: 'none', color: '#C9A84C' }}>FLASH</Link>
                      <button onClick={() => handleDelete(p.id)} style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', background: 'none', border: '1px solid #fca5a5', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', color: '#dc2626' }}>FSHI</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal overlay */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ background: 'var(--white)', borderRadius: 12, width: '100%', maxWidth: 640, marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, letterSpacing: '0.08em' }}>
                {mode === 'create' ? 'SHTO PRODUKT' : 'EDITO PRODUKTIN'}
              </h2>
              <button onClick={closeForm} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-mid)', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Emri i produktit *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Slug</label>
                  <input type="text" className="form-input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Përshkrimi</label>
                  <textarea className="form-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Çmimi (€) *</label>
                  <input type="number" step="0.01" min="0" className="form-input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Çmimi origjinal (€)</label>
                  <input type="number" step="0.01" min="0" className="form-input" value={form.compare_price} onChange={(e) => setForm((f) => ({ ...f, compare_price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Çmimi i kostos (€)</label>
                  <input type="number" step="0.01" min="0" className="form-input" value={form.cost_price} onChange={(e) => setForm((f) => ({ ...f, cost_price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input type="text" className="form-input" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stoku *</label>
                  <input type="number" min="0" className="form-input" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategoria</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {[...PRODUCT_CATEGORIES].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Madhësitë (ndani me presje)</label>
                  <input type="text" className="form-input" value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} placeholder="XS, S, M, L, XL" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngjyrat (ndani me presje)</label>
                  <input type="text" className="form-input" value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} placeholder="E zezë, E bardhë, E kuqe" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">URL-të e imazheve (një për rresht)</label>
                  <textarea className="form-textarea" value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} rows={3} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="is_active" style={{ fontSize: 13, cursor: 'pointer' }}>Produkti është aktiv (i dukshëm)</label>
                </div>
              </div>

              {formError && <p className="form-error" style={{ marginTop: 12 }}>{formError}</p>}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={closeForm} className="btn-secondary" style={{ width: 'auto', padding: '10px 24px' }}>ANULO</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                  {submitting ? 'DUKE RUAJTUR…' : mode === 'edit' ? 'RUAJ NDRYSHIMET' : 'SHTO PRODUKTIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
