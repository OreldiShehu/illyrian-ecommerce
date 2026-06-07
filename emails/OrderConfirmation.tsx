import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Row, Column,
} from '@react-email/components'
import * as React from 'react'
import { formatPrice, generateOrderNumber } from '@/lib/utils'

interface OrderItem {
  name: string
  quantity: number
  price: number
  size?: string
  color?: string
}

interface Props {
  customerName: string
  orderId: string
  items: OrderItem[]
  total: number
  deliveryFee: number
  shippingAddress: string
  shippingCity: string
}

export default function OrderConfirmation({ customerName, orderId, items, total, deliveryFee, shippingAddress, shippingCity }: Props) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  return (
    <Html lang="sq">
      <Head />
      <Preview>Porosia #{generateOrderNumber(orderId)} u konfirmua — MIO E-COMMERCE</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>MIO E-COMMERCE</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Porosia juaj u vendos!</Heading>
            <Text style={p}>Pershendetje {customerName},</Text>
            <Text style={p}>
              Porosia juaj <strong>#{generateOrderNumber(orderId)}</strong> u regjistrua me sukses.
              Shitësi do ta konfirmojë porosinë tuaj së shpejti.
            </Text>

            <Section style={itemsBox}>
              <Text style={sectionTitle}>Artikujt e porositur:</Text>
              {items.map((item, i) => (
                <Row key={i} style={itemRow}>
                  <Column style={itemName}>
                    {item.name}
                    {item.size && <Text style={itemMeta}> · Madhësia: {item.size}</Text>}
                    {item.color && <Text style={itemMeta}> · Ngjyra: {item.color}</Text>}
                    <Text style={itemMeta}>Sasia: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPrice}>{formatPrice(item.price * item.quantity)}</Column>
                </Row>
              ))}
              <Hr style={hrSmall} />
              <Row>
                <Column style={summaryLabel}>Nëntotali</Column>
                <Column style={summaryValue}>{formatPrice(subtotal)}</Column>
              </Row>
              <Row>
                <Column style={summaryLabel}>Dërgesa</Column>
                <Column style={summaryValue}>{deliveryFee === 0 ? 'Falas' : formatPrice(deliveryFee)}</Column>
              </Row>
              <Row>
                <Column style={totalLabel}>TOTALI</Column>
                <Column style={totalValue}>{formatPrice(total)}</Column>
              </Row>
            </Section>

            <Section style={deliveryBox}>
              <Text style={sectionTitle}>Adresa e dorëzimit:</Text>
              <Text style={p}>{shippingAddress}, {shippingCity}</Text>
              <Text style={p}>💵 Pagesa: Cash në dorëzim (COD)</Text>
              <Text style={p}>🕐 Koha e pritjes: 2-3 ditë pune</Text>
            </Section>

            <Hr style={hr} />
            <Text style={footer}>© 2026 MIO E-COMMERCE. Të gjitha të drejtat e rezervuara.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = { backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }
const container: React.CSSProperties = { margin: '0 auto', padding: '20px 0 48px', width: '580px' }
const header: React.CSSProperties = { backgroundColor: '#000000', padding: '20px 32px', textAlign: 'center', borderRadius: '8px 8px 0 0' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: '900', letterSpacing: '0.2em', margin: '0' }
const content: React.CSSProperties = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 8px 8px', border: '1px solid #e0e0e0', borderTop: 'none' }
const h1: React.CSSProperties = { color: '#000000', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }
const p: React.CSSProperties = { color: '#444444', fontSize: '14px', lineHeight: '1.7', margin: '0 0 8px' }
const sectionTitle: React.CSSProperties = { color: '#000000', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }
const itemsBox: React.CSSProperties = { backgroundColor: '#f4f4f4', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px' }
const itemRow: React.CSSProperties = { marginBottom: '8px' }
const itemName: React.CSSProperties = { color: '#000000', fontSize: '13px', fontWeight: '600' }
const itemMeta: React.CSSProperties = { color: '#777777', fontSize: '11px', margin: '2px 0' }
const itemPrice: React.CSSProperties = { color: '#000000', fontSize: '13px', fontWeight: '700', textAlign: 'right' }
const hrSmall: React.CSSProperties = { borderColor: '#e0e0e0', margin: '12px 0' }
const summaryLabel: React.CSSProperties = { color: '#777777', fontSize: '12px' }
const summaryValue: React.CSSProperties = { color: '#444444', fontSize: '12px', textAlign: 'right' }
const totalLabel: React.CSSProperties = { color: '#000000', fontSize: '14px', fontWeight: '700' }
const totalValue: React.CSSProperties = { color: '#000000', fontSize: '14px', fontWeight: '700', textAlign: 'right' }
const deliveryBox: React.CSSProperties = { backgroundColor: '#f4f4f4', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }
const hr: React.CSSProperties = { borderColor: '#e0e0e0', margin: '24px 0 16px' }
const footer: React.CSSProperties = { color: '#999999', fontSize: '11px', textAlign: 'center' }
