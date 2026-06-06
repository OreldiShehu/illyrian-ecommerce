import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SiteLayout from '@/components/layout/SiteLayout'
import { formatPrice, generateOrderNumber, formatDate } from '@/lib/utils'
import type { OrderWithItems } from '@/types'
import { ORDER_STATUSES } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

const STEPS: { key: string; label: string }[] = [
  { key: 'pending', label: 'Porositur' },
  { key: 'confirmed', label: 'Konfirmuar' },
  { key: 'shipped', label: 'Dërguar' },
  { key: 'delivered', label: 'Dorëzuar' },
]

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(id, name, slug, images), vendors(id, store_name, slug, whatsapp))')
    .eq('id', id)
    .eq('customer_id', user.id)
    .single()

  if (!order) notFound()

  const typedOrder = order as unknown as OrderWithItems
  const statusIndex = STEPS.findIndex((s) => s.key === order.status)

  // Get WhatsApp from first vendor
  const firstVendor = typedOrder.order_items[0]?.vendors

  return (
    <SiteLayout>
      <div className="page-inner" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 className="page-title">POROSIA #{generateOrderNumber(order.id)}</h1>
            <p className="page-subtitle">{formatDate(order.created_at)}</p>
          </div>
          <span className={`status-badge status-${order.status}`} style={{ fontSize: 12 }}>
            {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label ?? order.status}
          </span>
        </div>

        {/* Status stepper */}
        {order.status !== 'cancelled' && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STEPS.map((step, i) => {
                const isCompleted = statusIndex >= i
                const isLast = i === STEPS.length - 1
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isCompleted ? 'var(--black)' : 'var(--gray-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? 'var(--white)' : 'var(--gray-mid)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: isCompleted ? 'var(--black)' : 'var(--gray-mid)', whiteSpace: 'nowrap' }}>
                        {step.label.toUpperCase()}
                      </span>
                    </div>
                    {!isLast && (
                      <div style={{ flex: 1, height: 2, background: statusIndex > i ? 'var(--black)' : 'var(--gray-light)', margin: '0 4px', marginBottom: 22 }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: 'var(--black)', padding: '14px 20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--white)' }}>ARTIKUJT</p>
          </div>
          {typedOrder.order_items.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--gray-light)', alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, background: '#252525', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                {item.products?.images?.[0] && <Image src={item.products.images[0]} alt="" fill className="object-cover" sizes="64px" />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>
                  {item.products?.slug ? (
                    <Link href={`/products/${item.products.slug}`} style={{ color: 'var(--black)' }}>{item.products.name}</Link>
                  ) : item.products?.name}
                </p>
                {(item.size || item.color) && (
                  <p style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                )}
                <p style={{ fontSize: 12, color: 'var(--gray-dark)' }}>Sasia: {item.quantity}</p>
                {item.vendors && (
                  <Link href={`/stores/${item.vendors.slug}`} style={{ fontSize: 11, color: 'var(--gray-dark)', display: 'inline-block', marginTop: 2 }}>
                    {item.vendors.store_name}
                  </Link>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Delivery */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 12 }}>ADRESA E DORËZIMIT</p>
            <p style={{ fontSize: 13, marginBottom: 4 }}><strong>{order.shipping_name}</strong></p>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 4 }}>{order.shipping_address}</p>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 4 }}>{order.shipping_city}</p>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)' }}>Tel: {order.shipping_phone}</p>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 12 }}>PAGESA & TOTALI</p>
            <p style={{ fontSize: 13, marginBottom: 8 }}>💵 Cash në dorëzim</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900 }}>{formatPrice(order.total)}</p>
            {order.coupon_code && (
              <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>Kod: {order.coupon_code} (-{formatPrice(order.coupon_discount)})</p>
            )}
          </div>
        </div>

        {/* WhatsApp contact */}
        {firstVendor?.whatsapp && (
          <a
            href={`https://wa.me/${firstVendor.whatsapp.replace(/\D/g, '')}?text=Pershendetje, dua informacion per porosinë #${generateOrderNumber(order.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21" /><path d="M9 10c0 5 3.5 7.5 6 5" />
            </svg>
            KONTAKTO SHITËSIN NË WHATSAPP
          </a>
        )}
      </div>
    </SiteLayout>
  )
}
