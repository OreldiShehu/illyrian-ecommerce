import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CartProvider } from '@/components/providers/CartProvider'
import { LanguageProvider } from '@/lib/i18n'
import PWARegister from '@/components/PWARegister'

export const metadata: Metadata = {
  title: "MIO E-Commerce — Moda Shqiptare Online",
  description: "Zbulo, krahaso dhe porosit nga dyqanet më të mira shqiptare të modës — MIO E-Commerce.",
  keywords: ['moda shqiptare', 'dyqane online', 'fashion albania', 'mio ecommerce'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MIO',
  },
  openGraph: {
    title: "MIO E-Commerce",
    description: 'Platforma e modës shqiptare online.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#232F3E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sq">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MIO" />
        <meta name="application-name" content="MIO" />
        <meta name="msapplication-TileColor" content="#232F3E" />
      </head>
      <body>
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
        <PWARegister />
      </body>
    </html>
  )
}
