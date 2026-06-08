import Link from 'next/link'
import Image from 'next/image'
import type { VendorWithPlan, Product } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, getInitials, isFlashSaleActive, calculateFlashPrice } from '@/lib/utils'

interface Props {
  vendors: VendorWithPlan[]
}

async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_active', true)
    .limit(9)
  return (data ?? []) as Product[]
}

function getVendorRating(vendor: VendorWithPlan): number {
  const reviews = (vendor as unknown as { vendor_reviews?: { rating: number }[] }).vendor_reviews ?? []
  if (!reviews.length) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

function hasActiveOffer(vendor: VendorWithPlan): boolean {
  return !!(vendor as unknown as { has_flash_sale?: boolean }).has_flash_sale
}

interface ProductCardProps {
  product: Product & { flash_sales?: Array<{ discount_percent: number; starts_at: string; ends_at: string; is_active: boolean }> }
}

function ProductCardItem({ product }: ProductCardProps) {
  const activeFlashSale = product.flash_sales?.find(isFlashSaleActive)
  const displayPrice = activeFlashSale
    ? calculateFlashPrice(product.price, activeFlashSale.discount_percent)
    : product.price
  const originalPrice = activeFlashSale ? product.price : product.compare_price

  return (
    <Link href={`/products/${product.slug}`} className="product-card">
      <div className="product-img" style={{ background: 'linear-gradient(145deg, #252525, #111)' }}>
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 540px) 45vw, (max-width: 900px) 35vw, 280px"
            quality={85}
          />
        ) : (
          <span className="product-img-label">{product.category?.toUpperCase().slice(0, 6)}</span>
        )}
        {activeFlashSale && <span className="product-tag">🔥 FLASH</span>}
      </div>
      <div className="product-name">{product.name}</div>
      <div className="product-price">
        {formatPrice(displayPrice)}
        {originalPrice && originalPrice > displayPrice && (
          <s>{formatPrice(originalPrice)}</s>
        )}
      </div>
    </Link>
  )
}

interface StoreBlockProps {
  vendor: VendorWithPlan
}

async function StoreBlockItem({ vendor }: StoreBlockProps) {
  const products = await getVendorProducts(vendor.id)
  const rating = getVendorRating(vendor)
  const isNew = new Date(vendor.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const plan = (vendor as unknown as { vendor_plans?: { plan: string }[] }).vendor_plans?.[0]?.plan

  return (
    <div className="store-block">
      <div className="store-head">
        <div className="store-info">
          <div className="store-avatar">
            {vendor.logo_url ? (
              <Image src={vendor.logo_url} alt={vendor.store_name} width={42} height={42} className="object-cover rounded-[10px]" />
            ) : (
              getInitials(vendor.store_name)
            )}
          </div>
          <div>
            <div className="store-name">
              {vendor.store_name.toUpperCase()}
              {vendor.is_verified && (
                <span title="Dyqan i verifikuar" style={{ marginLeft: 6, color: '#C9A84C' }}>✓</span>
              )}
            </div>
            <div className="store-meta">
              {vendor.category} &nbsp;·&nbsp; {vendor.city}
              {rating > 0 && ` &nbsp;·&nbsp; ★ ${rating.toFixed(1)}`}
            </div>
          </div>
        </div>
        {isNew ? (
          <div className="store-badge newbadge">✦ NEW STORE</div>
        ) : plan === 'pro' ? (
          <div className="store-badge offer">🔥 OFFERS</div>
        ) : null}
      </div>

      {products.length > 0 ? (
        <div className="products-scroll">
          {products.map((product) => (
            <ProductCardItem key={product.id} product={product as ProductCardProps['product']} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.08em' }}>
          PRODUKTET VIJNË SË SHPEJTI
        </div>
      )}

      <div className="store-footer">
        <Link href={`/stores/${vendor.slug}`} className="view-store-btn">
          SHIKO DYQANIN →
        </Link>
      </div>
    </div>
  )
}

export default async function StoresSection({ vendors }: Props) {
  return (
    <section className="stores-section" id="stores">
      <div className="section-header">
        <h2 className="section-title">DYQANET / STORES</h2>
        <Link href="/stores" className="section-link">SHIKO TË GJITHA →</Link>
      </div>

      {vendors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-dark)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', fontSize: 13 }}>
          ASNJË DYQAN AKTIV MOMENTALISHT
        </div>
      ) : (
        vendors.map((vendor) => (
          <StoreBlockItem key={vendor.id} vendor={vendor} />
        ))
      )}
    </section>
  )
}
