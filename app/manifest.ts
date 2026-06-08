import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MIO E-Commerce — Moda Shqiptare',
    short_name: 'MIO',
    description: 'Zbulo, krahaso dhe porosit nga dyqanet më të mira shqiptare të modës.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#232F3E',
    orientation: 'portrait',
    categories: ['shopping', 'fashion'],
    lang: 'sq',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/brand-store.jpg',
        sizes: '1280x720',
        type: 'image/jpeg',
        // @ts-ignore — 'form_factor' is valid in the spec, TS types lag behind
        form_factor: 'wide',
        label: 'MIO E-Commerce — home page',
      },
    ],
  }
}
