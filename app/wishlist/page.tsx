import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import { getT } from '@/lib/i18n-server'
import { formatPrice } from '@/lib/utils'
import WishlistRemoveBtn from './WishlistRemoveBtn'

export const dynamic = 'force-dynamic'

type WishlistItem = {
  id: string
  created_at: string
  products: {
    id: string
    name: string
    price: number
    compare_price: number | null
    slug: string
    images: string[]
    category: string
    vendors: { store_name: string; slug: string } | null
  } | null
}

export default async function WishlistPage() {
  const [supabase, t] = await Promise.all([createClient(), getT()])
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('wishlists')
    .select('id, created_at, products(id, name, price, compare_price, slug, images, category, vendors(store_name, slug))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = (data ?? []) as WishlistItem[]
  const validItems = items.filter((i) => i.products !== null)

  return (
    <SiteLayout>
      <div className="page-container">
        <div className="page-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title" style={{ marginBottom: 0 }}>{t('wishlist.title')}</h1>
              {validItems.length > 0 && (
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gray-mid)', marginTop: 6 }}>
                  {validItems.length} {t('wishlist.count')}
                </p>
              )}
            </div>
          </div>

          {validItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-mid)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 16, color: 'var(--gray-light)' }}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>
                {t('wishlist.empty')}
              </p>
              <Link
                href="/products"
                className="btn-primary"
                style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '12px 28px' }}
              >
                {t('wishlist.browse')}
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 20,
            }}>
              {validItems.map((item) => {
                const product = item.products!

                return (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--white)', transition: 'box-shadow 0.2s, transform 0.2s' }}
                        onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 4px 20px rgba(35,47,62,0.12)'; el.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.transform = 'none' }}
                      >
                        <div style={{ position: 'relative', aspectRatio: '1/1', background: 'linear-gradient(145deg, #f0f1f2, #e5e7eb)', overflow: 'hidden' }}>
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, 220px"
                              quality={80}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--gray-mid)', letterSpacing: '0.1em' }}>
                              {product.category?.toUpperCase().slice(0, 6)}
                            </div>
                          )}
                        </div>

                        <div style={{ padding: '12px 14px 14px' }}>
                          {product.vendors && (
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-dark)', marginBottom: 4 }}>
                              {product.vendors.store_name.toUpperCase()}
                            </p>
                          )}
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)', lineHeight: 1.35, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {product.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--accent-dark)' }}>
                              {formatPrice(product.price)}
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <s style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{formatPrice(product.compare_price)}</s>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Remove button - outside Link to avoid nesting issues */}
                    <WishlistRemoveBtn wishlistId={item.id} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  )
}
