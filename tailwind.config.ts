import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './emails/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        'gold-light': '#e8b84b',
        'store-bg': '#252525',
        'footer-bg': '#161616',
        'off-white': '#f4f4f4',
        'gray-light': '#e0e0e0',
        'gray-mid': '#b2b2b2',
        'gray-dark': '#8a8a8a',
        border: '#d8d8d8',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
