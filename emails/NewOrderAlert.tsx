import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, Row, Column,
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
  orderId: string
  storeName: string
  items: OrderItem[]
  customerCity: string
  total: number
  appUrl: string
}

export default function NewOrderAlert({ orderId, storeName, items, customerCity, total, appUrl }: Props) {
  return (
    <Html lang="sq">
      <Head />
      <Preview>Porosi e re #{generateOrderNumber(orderId)} — kërkon vëmendje</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>MIO E-COMMERCE</Text>
            <Text style={logoSub}>NJOFTIM PËR SHITËS</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>🛒 Porosi e Re!</Heading>
            <Text style={p}>
              Dyqani <strong>{storeName}</strong> ka marrë një porosi të re.
            </Text>

            <Section style={alertBox}>
              <Text style={alertTitle}>#{generateOrderNumber(orderId)}</Text>
              <Text style={alertMeta}>📍 Qyteti i klientit: {customerCity}</Text>
              <Text style={alertMeta}>💰 Totali: {formatPrice(total)}</Text>
            </Section>

            <Section style={itemsBox}>
              <Text style={sectionTitle}>Artikujt:</Text>
              {items.map((item, i) => (
                <Row key={i} style={{ marginBottom: '6px' }}>
                  <Column style={itemName}>{item.quantity}× {item.name}{item.size ? ` (${item.size})` : ''}</Column>
                  <Column style={itemPrice}>{formatPrice(item.price * item.quantity)}</Column>
                </Row>
              ))}
            </Section>

            <Button style={btn} href={`${appUrl}/vendor/orders`}>
              KONFIRMO POROSINË
            </Button>

            <Hr style={hr} />
            <Text style={footer}>© 2026 MIO E-COMMERCE</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = { backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }
const container: React.CSSProperties = { margin: '0 auto', padding: '20px 0 48px', width: '580px' }
const header: React.CSSProperties = { backgroundColor: '#000000', padding: '20px 32px', textAlign: 'center', borderRadius: '8px 8px 0 0' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: '900', letterSpacing: '0.2em', margin: '0 0 4px' }
const logoSub: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '0.15em', margin: '0' }
const content: React.CSSProperties = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 8px 8px', border: '1px solid #e0e0e0', borderTop: 'none' }
const h1: React.CSSProperties = { color: '#000000', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }
const p: React.CSSProperties = { color: '#444444', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px' }
const alertBox: React.CSSProperties = { backgroundColor: '#000000', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px' }
const alertTitle: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }
const alertMeta: React.CSSProperties = { color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 4px' }
const itemsBox: React.CSSProperties = { backgroundColor: '#f4f4f4', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }
const sectionTitle: React.CSSProperties = { color: '#000000', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '10px' }
const itemName: React.CSSProperties = { color: '#444444', fontSize: '13px' }
const itemPrice: React.CSSProperties = { color: '#000000', fontSize: '13px', fontWeight: '700', textAlign: 'right' }
const btn: React.CSSProperties = { backgroundColor: '#000000', borderRadius: '4px', color: '#ffffff', display: 'block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', padding: '14px 28px', textAlign: 'center', textDecoration: 'none', marginBottom: '24px' }
const hr: React.CSSProperties = { borderColor: '#e0e0e0', margin: '24px 0 16px' }
const footer: React.CSSProperties = { color: '#999999', fontSize: '11px', textAlign: 'center' }
