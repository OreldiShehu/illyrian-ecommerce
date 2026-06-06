import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import * as React from 'react'
import { generateOrderNumber } from '@/lib/utils'

interface Props {
  customerName: string
  orderId: string
  status: 'confirmed' | 'shipped'
  vendorName?: string
  appUrl: string
}

const STATUS_CONTENT = {
  confirmed: {
    preview: 'Porosia juaj u konfirmua nga shitësi',
    heading: 'Porosia u Konfirmua ✓',
    message: 'Shitësi ka konfirmuar porosinë tuaj dhe po përgatit produktet. Do të njoftoheni kur të dërgohet.',
    btnText: 'SHIKO POROSINË',
  },
  shipped: {
    preview: 'Porosia juaj është dërguar',
    heading: 'Porosia u Dërgua 🚚',
    message: 'Porosia juaj është nisur drejt adresës suaj. Prisni dorëzimin brenda 1-2 ditëve të ardhshme pune.',
    btnText: 'SHIKO POROSINË',
  },
}

export default function OrderStatusUpdate({ customerName, orderId, status, vendorName, appUrl }: Props) {
  const copy = STATUS_CONTENT[status]
  return (
    <Html lang="sq">
      <Head />
      <Preview>{copy.preview} — #{generateOrderNumber(orderId)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerStyle}>
            <Text style={logo}>ZAZA&apos;S E-COMMERCE</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>{copy.heading}</Heading>
            <Text style={p}>Pershendetje {customerName},</Text>
            <Text style={p}>
              Porosia juaj <strong>#{generateOrderNumber(orderId)}</strong>{vendorName ? ` nga ${vendorName}` : ''} ka një përditësim.
            </Text>
            <Text style={p}>{copy.message}</Text>
            <Button style={btn} href={`${appUrl}/orders/${orderId}`}>
              {copy.btnText}
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
const headerStyle: React.CSSProperties = { backgroundColor: '#000000', padding: '20px 32px', textAlign: 'center', borderRadius: '8px 8px 0 0' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: '900', letterSpacing: '0.2em', margin: '0' }
const content: React.CSSProperties = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 8px 8px', border: '1px solid #e0e0e0', borderTop: 'none' }
const h1: React.CSSProperties = { color: '#000000', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }
const p: React.CSSProperties = { color: '#444444', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px' }
const btn: React.CSSProperties = { backgroundColor: '#000000', borderRadius: '4px', color: '#ffffff', display: 'block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', padding: '14px 28px', textAlign: 'center', textDecoration: 'none', marginBottom: '24px' }
const hr: React.CSSProperties = { borderColor: '#e0e0e0', margin: '24px 0 16px' }
const footer: React.CSSProperties = { color: '#999999', fontSize: '11px', textAlign: 'center' }
