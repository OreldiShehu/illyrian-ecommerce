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
  name: string
  appUrl: string
}

export default function CustomerWelcome({ name, appUrl }: Props) {
  return (
    <Html lang="sq">
      <Head />
      <Preview>Mirë se vini në Zaza&apos;s E-Commerce!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>ZAZA&apos;S E-COMMERCE</Text>
            <Text style={logoSub}>DISCOVER · COMPARE · ORDER</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Mirë se vini, {name}!</Heading>
            <Text style={p}>
              Faleminderit që u bashkuat me Zaza&apos;s E-Commerce — platformën
              më të mirë të modës shqiptare online.
            </Text>
            <Text style={p}>
              Tani mund të eksploroni dyqane të zgjedhura, të krahasoni produktet
              dhe të bëni porosi me besim — të gjitha në një vend.
            </Text>

            <Section style={featureBox}>
              <Text style={featureTitle}>Si funksionon:</Text>
              <Text style={featureItem}>🏪 Eksploroni dyqanet — qindra dyqane shqiptare të modës</Text>
              <Text style={featureItem}>⭐ Krahasoni produktet — lexoni recensione reale</Text>
              <Text style={featureItem}>🛒 Porositni lehtë — paguani me dorëzim (COD)</Text>
              <Text style={featureItem}>🎁 Fitoni pikë besnikërie — 1 pikë për çdo €1</Text>
            </Section>

            <Button style={btn} href={`${appUrl}/stores`}>
              EKSPLORONI DYQANET
            </Button>

            <Hr style={hr} />
            <Text style={footer}>
              © 2026 Zaza&apos;s E-Commerce. Të gjitha të drejtat e rezervuara.
            </Text>
            <Text style={footer}>
              Platforma e modës shqiptare online.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f4f4f4',
  fontFamily: 'Arial, sans-serif',
}

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
}

const header: React.CSSProperties = {
  backgroundColor: '#000000',
  padding: '24px 32px',
  textAlign: 'center',
  borderRadius: '8px 8px 0 0',
}

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '900',
  letterSpacing: '0.2em',
  margin: '0 0 4px',
}

const logoSub: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '10px',
  letterSpacing: '0.15em',
  margin: '0',
}

const content: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '32px',
  borderRadius: '0 0 8px 8px',
  border: '1px solid #e0e0e0',
  borderTop: 'none',
}

const h1: React.CSSProperties = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '700',
  marginBottom: '16px',
}

const p: React.CSSProperties = {
  color: '#444444',
  fontSize: '14px',
  lineHeight: '1.7',
  marginBottom: '16px',
}

const featureBox: React.CSSProperties = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  padding: '20px 24px',
  marginBottom: '24px',
}

const featureTitle: React.CSSProperties = {
  color: '#000000',
  fontSize: '13px',
  fontWeight: '700',
  marginBottom: '12px',
}

const featureItem: React.CSSProperties = {
  color: '#444444',
  fontSize: '13px',
  lineHeight: '1.6',
  marginBottom: '6px',
}

const btn: React.CSSProperties = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  padding: '14px 28px',
  textAlign: 'center',
  textDecoration: 'none',
  marginBottom: '24px',
}

const hr: React.CSSProperties = {
  borderColor: '#e0e0e0',
  margin: '24px 0 16px',
}

const footer: React.CSSProperties = {
  color: '#999999',
  fontSize: '11px',
  textAlign: 'center',
  margin: '0 0 4px',
}
