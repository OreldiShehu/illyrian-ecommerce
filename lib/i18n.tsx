'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { dict } from './i18n-dict'

export type Locale = 'sq' | 'en' | 'it'

const STORAGE_KEY = 'mio-locale'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

interface LanguageContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'sq',
  setLocale: () => {},
  t: (key) => dict.sq[key] ?? key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('sq')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === 'sq' || stored === 'en' || stored === 'it') {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
    // Also set cookie so server components can read the locale
    document.cookie = `mio-locale=${l};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`
  }

  const t = (key: string): string => dict[locale][key] ?? dict.sq[key] ?? key

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
