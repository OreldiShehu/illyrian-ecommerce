import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import * as React from 'react'
import { formatPrice, formatDate } from '@/lib/utils'

interface Props {
  storeName: string
  amountOwed: number
  dueDate: string
  appUrl: string
}

export default function CommissionReminder({ storeName, amountOwed, dueDate, appUrl }: Props) {
  return (
    <Html lang="sq">
      <Head />
      <Preview>Komisioni i papaguar — {formatPrice(amountOwed)} deri më {formatDate(dueDate)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>MIO E-COMMERCE</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>⚠️ Komisioni i Papaguar</Heading>
            <Text style={p}>Pershendetje {storeName},</Text>
            <Text style={p}>
              Keni komision të papaguar në shumën prej <strong>{formatPrice(amountOwed)}</strong>.
              Data e fundit e pagesës është <strong>{formatDate(dueDate)}</strong>.
            </Text>

            <Section style={alertBox}>
              <Text style={alertAmount}>{formatPrice(amountOwed)}</Text>
              <Text style={alertDate}>Afati: {formatDate(dueDate)}</Text>
            </Section>

            <Text style={p}>
              Ju lutemi kryeni pagesën para afatit për të mbajtur dyqanin tuaj aktiv.
              Pasi kryeni pagesën, shënojeni si të paguar në panel.
            </Text>

            <Button style={btn} href={`${appUrl}/vendor/commissions`}>
              SHIKO KOMISIONET
            </Button>

            <Hr style={hr} />
            <Text style={footer}>Për ndihmë: kontaktoni ekipin e MIO E-COMMERCE.</Text>
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
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: '900', letterSpacing: '0.2em', margin: '0' }
const content: React.CSSProperties = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 8px 8px', border: '1px solid #e0e0e0', borderTop: 'none' }
const h1: React.CSSProperties = { color: '#000000', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }
const p: React.CSSProperties = { color: '#444444', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px' }
const alertBox: React.CSSProperties = { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', textAlign: 'center' }
const alertAmount: React.CSSProperties = { color: '#DC2626', fontSize: '28px', fontWeight: '700', margin: '0 0 4px' }
const alertDate: React.CSSProperties = { color: '#DC2626', fontSize: '13px', margin: '0' }
const btn: React.CSSProperties = { backgroundColor: '#000000', borderRadius: '4px', color: '#ffffff', display: 'block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', padding: '14px 28px', textAlign: 'center', textDecoration: 'none', marginBottom: '24px' }
const hr: React.CSSProperties = { borderColor: '#e0e0e0', margin: '24px 0 16px' }
const footer: React.CSSProperties = { color: '#999999', fontSize: '11px', textAlign: 'center', margin: '0 0 4px' }
