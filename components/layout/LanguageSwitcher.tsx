'use client'

import { useLanguage, type Locale } from '@/lib/i18n'

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'sq', label: 'SQ' },
  { code: 'en', label: 'EN' },
  { code: 'it', label: 'IT' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {LOCALES.map(({ code, label }, i) => (
        <span key={code} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setLocale(code)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              fontWeight: locale === code ? 900 : 400,
              letterSpacing: '0.08em',
              color: locale === code ? 'var(--black)' : 'var(--gray-mid)',
              padding: '2px 0',
              borderBottom: locale === code ? '1.5px solid var(--black)' : '1.5px solid transparent',
              lineHeight: 1,
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
          {i < LOCALES.length - 1 && (
            <span style={{ color: 'var(--gray-light)', fontSize: 9 }}>|</span>
          )}
        </span>
      ))}
    </div>
  )
}
