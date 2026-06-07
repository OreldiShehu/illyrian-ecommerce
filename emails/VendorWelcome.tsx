import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  storeName: string
  appUrl: string
}

export default function VendorWelcome({ storeName, appUrl }: Props) {
  return (
    <Html lang="sq">
      <Head />
      <Preview>Dyqani juaj në MIO E-COMMERCE — hapat e ardhshëm</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>MIO E-COMMERCE</Text>
            <Text style={logoSub}>PLATFORMË PËR SHITËSIT</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Aplikimi juaj u pranua!</Heading>
            <Text style={p}>
              Faleminderit që aplikuat për të hapur dyqanin <strong>{storeName}</strong> në
              MIO E-COMMERCE. Ekipi ynë do të rishikojë aplikimin tuaj brenda 24 orësh.
            </Text>

            <Section style={stepsBox}>
              <Text style={stepsTitle}>Hapat e ardhshëm:</Text>
              <Text style={step}>
                <strong>1. Rishikimi</strong> — Ekipi ynë do të kontrollojë informacionin e dyqanit tuaj
              </Text>
              <Text style={step}>
                <strong>2. Njoftimi</strong> — Do të merrni email kur aplikimi të aprovohet
              </Text>
              <Text style={step}>
                <strong>3. Aktivizimi</strong> — Dyqani juaj bëhet i dukshëm për blerësit
              </Text>
              <Text style={step}>
                <strong>4. Shitjet</strong> — Shtoni produktet dhe filloni të shisni
              </Text>
            </Section>

            <Button style={btn} href={`${appUrl}/vendor/dashboard`}>
              SHKO TE PANELI
            </Button>

            <Hr style={hr} />
            <Text style={footer}>
              Komisioni standard: 12% për çdo shitje të suksesshme.
            </Text>
            <Text style={footer}>
              © 2026 MIO E-COMMERCE. Të gjitha të drejtat e rezervuara.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = { backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }
const container: React.CSSProperties = { margin: '0 auto', padding: '20px 0 48px', width: '580px' }
const header: React.CSSProperties = { backgroundColor: '#000000', padding: '24px 32px', textAlign: 'center', borderRadius: '8px 8px 0 0' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: '900', letterSpacing: '0.2em', margin: '0 0 4px' }
const logoSub: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '0.15em', margin: '0' }
const content: React.CSSProperties = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 8px 8px', border: '1px solid #e0e0e0', borderTop: 'none' }
const h1: React.CSSProperties = { color: '#000000', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }
const p: React.CSSProperties = { color: '#444444', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }
const stepsBox: React.CSSProperties = { backgroundColor: '#f4f4f4', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px' }
const stepsTitle: React.CSSProperties = { color: '#000000', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }
const step: React.CSSProperties = { color: '#444444', fontSize: '13px', lineHeight: '1.6', marginBottom: '8px' }
const btn: React.CSSProperties = { backgroundColor: '#000000', borderRadius: '4px', color: '#ffffff', display: 'block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em', padding: '14px 28px', textAlign: 'center', textDecoration: 'none', marginBottom: '24px' }
const hr: React.CSSProperties = { borderColor: '#e0e0e0', margin: '24px 0 16px' }
const footer: React.CSSProperties = { color: '#999999', fontSize: '11px', textAlign: 'center', margin: '0 0 4px' }
