import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/providers/CartProvider'

export const metadata: Metadata = {
  title: "MIO E-Commerce — Moda Shqiptare Online",
  description: "Zbulo, krahaso dhe porosit nga dyqanet më të mira shqiptare të modës — MIO E-Commerce.",
  keywords: ['moda shqiptare', 'dyqane online', 'fashion albania', 'mio ecommerce'],
  openGraph: {
    title: "MIO E-Commerce",
    description: 'Platforma e modës shqiptare online.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sq">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
