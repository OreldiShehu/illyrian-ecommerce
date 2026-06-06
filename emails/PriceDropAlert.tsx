import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import * as React from 'react'
import { formatPrice } from '@/lib/utils'

interface Props {
  customerName: string
  productName: string
  oldPrice: number
  newPrice: number
  productSlug: string
  appUrl: string
}

export default function PriceDropAlert({ customerName, productName, oldPrice, newPrice, productSlug, appUrl }: Props) {
  const saving = oldPrice - newPrice
  const savingPercent = Math.round((saving / oldPrice) * 100)

  return (
    <Html lang="sq">
      <Head />
      <Preview>Çmimi u ul {savingPercent}% — {productName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>ZAZA&apos;S E-COMMERCE</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>🔥 Çmimi u Ul!</Heading>
            <Text style={p}>Pershendetje {customerName},</Text>
            <Text style={p}>
              Një produkt nga lista juaj e dëshirave ka zbritur çmimin!
            </Text>

            <Section style={productBox}>
              <Text style={productName_}>{productName}</Text>
              <Text style={oldPriceStyle}>{formatPrice(oldPrice)}</Text>
              <Text style={newPriceStyle}>{formatPrice(newPrice)}</Text>
              <Text style={savingStyle}>Kurseni {formatPrice(saving)} ({savingPercent}%)</Text>
            </Section>

            <Button style={btn} href={`${appUrl}/products/${productSlug}`}>
              BLIJ TANI
            </Button>

            <Hr style={hr} />
            <Text style={footer}>© 2026 Zaza&apos;s E-Commerce</Text>
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
const p: React.CSSProperties = { color: '#444444', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px' }
const productBox: React.CSSProperties = { backgroundColor: '#f4f4f4', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px', textAlign: 'center' }
const productName_: React.CSSProperties = { color: '#000000', fontSize: '16px', fontWeight: '700', margin: '0 0 12px' }
const oldPriceStyle: React.CSSProperties = { color: '#999999', fontSize: '14px', textDecoration: 'line-through', margin: '0 0 4px' }
const newPriceStyle: React.CSSProperties = { color: '#000000', fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }
const savingStyle: React.CSSProperties = { color: '#16a34a', fontSize: '13px', fontWeight: '600', margin: '0' }
const btn: React.CSSProperties = { backgroundColor: '#000000', borderRadius: '4px', color: '#ffffff', display: 'block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', padding: '14px 28px', textAlign: 'center', textDecoration: 'none', marginBottom: '24px' }
const hr: React.CSSProperties = { borderColor: '#e0e0e0', margin: '24px 0 16px' }
const footer: React.CSSProperties = { color: '#999999', fontSize: '11px', textAlign: 'center' }
