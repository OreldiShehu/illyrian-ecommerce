import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SiteLayout from '@/components/layout/SiteLayout'
import { formatPrice, generateOrderNumber } from '@/lib/utils'
import type { OrderWithItems } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await admin
    .from('orders')
    .select('*, order_items(*, products(id, name, images, slug), vendors(id, store_name, slug))')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const typedOrder = order as unknown as OrderWithItems
  const canViewOrder = !!(order.customer_id && user?.id === order.customer_id)

  return (
    <SiteLayout>
      <div className="page-inner" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--black)', marginBottom: 8 }}>
            POROSIA U VENDOS!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-dark)' }}>
            Numri i porosisë: <strong>{generateOrderNumber(order.id)}</strong>
          </p>
        </div>

        {/* Items */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ background: 'var(--black)', padding: '14px 20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--white)' }}>ARTIKUJT E POROSITUR</p>
          </div>
          {typedOrder.order_items.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--gray-light)', alignItems: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 8, background: '#252525', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                {item.products?.images?.[0] && <Image src={item.products.images[0]} alt={item.products.name ?? ''} fill className="object-cover" sizes="60px" />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{item.products?.name}</p>
                {(item.size || item.color) && (
                  <p style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                )}
                <p style={{ fontSize: 12, color: 'var(--gray-dark)' }}>Sasia: {item.quantity}</p>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Delivery summary */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ background: 'var(--black)', padding: '14px 20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--white)' }}>INFORMACIONI I DORËZIMIT</p>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 13, marginBottom: 6 }}><strong>{order.shipping_name}</strong></p>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 4 }}>{order.shipping_address}, {order.shipping_city}</p>
            <p style={{ fontSize: 13, color: 'var(--gray-dark)', marginBottom: 4 }}>Tel: {order.shipping_phone}</p>
            {order.shipping_notes && (
              <p style={{ fontSize: 12, color: 'var(--gray-mid)', marginBottom: 4 }}>Shënime: {order.shipping_notes}</p>
            )}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-light)' }}>
              <p style={{ fontSize: 13, marginBottom: 6 }}>💵 Pagesa: <strong>Cash në dorëzim (COD)</strong></p>
              <p style={{ fontSize: 13 }}>🕐 Koha e pritjes: <strong>2-3 ditë pune</strong></p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div style={{ border: '2px solid var(--black)', borderRadius: 10, padding: '16px 20px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>TOTALI PËR T&apos;U PAGUAR</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900 }}>{formatPrice(order.total)}</span>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {canViewOrder && (
            <Link href={`/orders/${order.id}`} className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '13px 28px', width: 'auto' }}>
              SHIKO POROSINË
            </Link>
          )}
          <Link href="/stores" className="btn-secondary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 20px' }}>
            VAZHDO BLERJET
          </Link>
        </div>
      </div>
    </SiteLayout>
  )
}
