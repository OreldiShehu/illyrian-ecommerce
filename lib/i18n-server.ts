import { cookies } from 'next/headers'
import { dict } from './i18n-dict'
import type { Locale } from './i18n'

const VALID: Locale[] = ['sq', 'en', 'it']

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const val = store.get('mio-locale')?.value ?? 'sq'
  return VALID.includes(val as Locale) ? (val as Locale) : 'sq'
}

export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale()
  return (key: string) => dict[locale][key] ?? dict.sq[key] ?? key
}
