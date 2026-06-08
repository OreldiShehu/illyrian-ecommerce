'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Locale = 'sq' | 'en' | 'it'

const STORAGE_KEY = 'mio-locale'

const dict: Record<Locale, Record<string, string>> = {
  sq: {
    // Nav
    'nav.home': 'HOME',
    'nav.stores': 'DYQANET',
    'nav.offers': 'OFERTAT',
    'nav.new': 'TË REJA',
    'nav.sell': 'SHIT ME NE',
    'nav.account': 'LLOGARIA',
    'nav.logout': 'DIL',
    'nav.login': 'HYR',
    'nav.register': 'REGJISTROHU',
    'nav.cart': 'Shporta',
    // Announcement
    'announce.shipping': 'Dërgesa falas për porosi mbi €50',
    'announce.new_stores': 'Dyqane të reja çdo javë',
    'announce.discount': 'Regjistrohu dhe merr 10% zbritje në porosinë e parë',
    // Cart
    'cart.title': 'SHPORTA',
    'cart.empty': 'SHPORTA ËSHTË BOSH',
    'cart.browse': 'SHIKO DYQANET',
    'cart.subtotal': 'Nëntotali',
    'cart.checkout': 'VAZHDO ME BLERJEN',
    'cart.continue': 'VAZHDONI BLERJEN',
    // Checkout
    'checkout.title': 'CHECKOUT',
    'checkout.delivery_address': 'ADRESA E DORËZIMIT',
    'checkout.fullname': 'Emri i plotë',
    'checkout.phone': 'Numri i telefonit',
    'checkout.address': 'Adresa',
    'checkout.city': 'Qyteti',
    'checkout.notes': 'Apartament / Shënime',
    'checkout.payment_method': 'MËNYRA E PAGESËS',
    'checkout.cod': 'PAGUAJ ME DORËZIM (CASH)',
    'checkout.cod_desc': 'Paguani me cash kur të merrni porosinë',
    'checkout.summary': 'PËRMBLEDHJA E POROSISË',
    'checkout.coupon': 'Kodi i zbritjes',
    'checkout.apply': 'APLIKO',
    'checkout.remove': 'HIQE',
    'checkout.subtotal': 'Nëntotali',
    'checkout.discount': 'Zbritja',
    'checkout.loyalty': 'Pikë besnikërie',
    'checkout.delivery': 'Dërgesa',
    'checkout.free': 'Falas',
    'checkout.total': 'TOTALI',
    'checkout.placing': 'DUKE POROSITUR…',
    'checkout.order_btn': 'POROSIT',
    'checkout.cash_note': '💵 Pagesa me cash gjatë dorëzimit',
    'checkout.delivery_note': '🕐 Dorëzim: 2-3 ditë pune',
    'checkout.empty_title': 'SHPORTA JUAJ ËSHTË BOSH',
    'checkout.explore': 'EKSPLORONI DYQANET',
    'checkout.invalid_coupon': 'Kodi i pavlefshëm.',
    'checkout.error': 'Porosia dështoi. Provoni përsëri.',
    // Auth
    'auth.login_title': 'KYÇU',
    'auth.email': 'Email',
    'auth.password': 'Fjalëkalimi',
    'auth.login_btn': 'KYÇU',
    'auth.logging_in': 'DUKE HYRË…',
    'auth.no_account': 'Nuk keni llogari?',
    'auth.register_link': 'REGJISTROHU',
    'auth.have_account': 'Keni tashmë llogari?',
    'auth.login_link': 'KYÇU',
    'auth.register_title': 'REGJISTROHU',
    'auth.fullname': 'Emri i plotë',
    'auth.phone': 'Numri i telefonit',
    'auth.confirm_password': 'Konfirmo fjalëkalimin',
    'auth.register_btn': 'REGJISTROHU',
    'auth.open_store_btn': 'HAP DYQANIN',
    'auth.registering': 'DUKE REGJISTRUAR...',
    'auth.as_customer': 'BLI SI KLIENT',
    'auth.as_vendor': 'HAP DYQANIN',
    'auth.invalid_login': 'Email ose fjalëkalim i gabuar.',
    'auth.vendor_note': 'Pas regjistrimit do të plotësoni detajet e dyqanit tuaj. Rishikohet brenda 24 orësh.',
    'auth.required': 'Të gjitha fushat janë të detyrueshme.',
    'auth.password_mismatch': 'Fjalëkalimet nuk përputhen.',
    'auth.password_short': 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.',
    'auth.already_registered': 'Ky email është tashmë i regjistruar.',
    'auth.confirm_email': 'Regjistrimi u krye! Kontrolloni emailin tuaj dhe konfirmoni llogarinë para se të hyni.',
    'auth.forgot_password': 'Keni harruar fjalëkalimin?',
    'auth.forgot_password_title': 'RIVENDOS FJALËKALIMIN',
    'auth.forgot_password_desc': 'Shkruani emailin tuaj dhe do t\'ju dërgojmë instruksione për rivendosjen.',
    'auth.send_reset': 'DËRGO LINK-UN',
    'auth.sending': 'DUKE DËRGUAR...',
    'auth.reset_sent': 'Link-u u dërgua! Kontrolloni emailin tuaj.',
    'auth.back_to_login': '← Kthehu te Kyçja',
    'auth.new_password_title': 'FJALËKALIM I RI',
    'auth.new_password': 'Fjalëkalimi i ri',
    'auth.update_password': 'NDRYSHO FJALËKALIMIN',
    'auth.updating': 'DUKE NDRYSHUAR...',
    'auth.password_updated': 'Fjalëkalimi u ndryshua! Duke ju ridrejtuar...',
    'auth.invalid_reset': 'Lidhja e rivendosjes është e pavlefshme ose ka skaduar.',
  },
  en: {
    // Nav
    'nav.home': 'HOME',
    'nav.stores': 'STORES',
    'nav.offers': 'OFFERS',
    'nav.new': 'NEW IN',
    'nav.sell': 'SELL WITH US',
    'nav.account': 'ACCOUNT',
    'nav.logout': 'LOG OUT',
    'nav.login': 'LOG IN',
    'nav.register': 'REGISTER',
    'nav.cart': 'Cart',
    // Announcement
    'announce.shipping': 'Free delivery on orders over €50',
    'announce.new_stores': 'New stores every week',
    'announce.discount': 'Register and get 10% off your first order',
    // Cart
    'cart.title': 'CART',
    'cart.empty': 'YOUR CART IS EMPTY',
    'cart.browse': 'BROWSE STORES',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'PROCEED TO CHECKOUT',
    'cart.continue': 'CONTINUE SHOPPING',
    // Checkout
    'checkout.title': 'CHECKOUT',
    'checkout.delivery_address': 'DELIVERY ADDRESS',
    'checkout.fullname': 'Full name',
    'checkout.phone': 'Phone number',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.notes': 'Apartment / Notes',
    'checkout.payment_method': 'PAYMENT METHOD',
    'checkout.cod': 'PAY ON DELIVERY (CASH)',
    'checkout.cod_desc': 'Pay with cash when you receive your order',
    'checkout.summary': 'ORDER SUMMARY',
    'checkout.coupon': 'Discount code',
    'checkout.apply': 'APPLY',
    'checkout.remove': 'REMOVE',
    'checkout.subtotal': 'Subtotal',
    'checkout.discount': 'Discount',
    'checkout.loyalty': 'Loyalty points',
    'checkout.delivery': 'Delivery',
    'checkout.free': 'Free',
    'checkout.total': 'TOTAL',
    'checkout.placing': 'PLACING ORDER…',
    'checkout.order_btn': 'PLACE ORDER',
    'checkout.cash_note': '💵 Cash on delivery',
    'checkout.delivery_note': '🕐 Delivery: 2-3 business days',
    'checkout.empty_title': 'YOUR CART IS EMPTY',
    'checkout.explore': 'EXPLORE STORES',
    'checkout.invalid_coupon': 'Invalid code.',
    'checkout.error': 'Order failed. Please try again.',
    // Auth
    'auth.login_title': 'LOG IN',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login_btn': 'LOG IN',
    'auth.logging_in': 'LOGGING IN…',
    'auth.no_account': "Don't have an account?",
    'auth.register_link': 'REGISTER',
    'auth.have_account': 'Already have an account?',
    'auth.login_link': 'LOG IN',
    'auth.register_title': 'REGISTER',
    'auth.fullname': 'Full name',
    'auth.phone': 'Phone number',
    'auth.confirm_password': 'Confirm password',
    'auth.register_btn': 'REGISTER',
    'auth.open_store_btn': 'OPEN STORE',
    'auth.registering': 'REGISTERING...',
    'auth.as_customer': 'SHOP AS CUSTOMER',
    'auth.as_vendor': 'OPEN A STORE',
    'auth.invalid_login': 'Incorrect email or password.',
    'auth.vendor_note': 'After registration you will complete your store details. Reviewed within 24 hours.',
    'auth.required': 'All fields are required.',
    'auth.password_mismatch': 'Passwords do not match.',
    'auth.password_short': 'Password must be at least 8 characters.',
    'auth.already_registered': 'This email is already registered.',
    'auth.confirm_email': 'Registration complete! Check your email and confirm your account before logging in.',
    'auth.forgot_password': 'Forgot your password?',
    'auth.forgot_password_title': 'RESET PASSWORD',
    'auth.forgot_password_desc': 'Enter your email and we\'ll send you reset instructions.',
    'auth.send_reset': 'SEND RESET LINK',
    'auth.sending': 'SENDING...',
    'auth.reset_sent': 'Link sent! Check your email.',
    'auth.back_to_login': '← Back to Login',
    'auth.new_password_title': 'NEW PASSWORD',
    'auth.new_password': 'New password',
    'auth.update_password': 'UPDATE PASSWORD',
    'auth.updating': 'UPDATING...',
    'auth.password_updated': 'Password updated! Redirecting...',
    'auth.invalid_reset': 'The reset link is invalid or has expired.',
  },
  it: {
    // Nav
    'nav.home': 'HOME',
    'nav.stores': 'NEGOZI',
    'nav.offers': 'OFFERTE',
    'nav.new': 'NOVITÀ',
    'nav.sell': 'VENDI CON NOI',
    'nav.account': 'ACCOUNT',
    'nav.logout': 'ESCI',
    'nav.login': 'ACCEDI',
    'nav.register': 'REGISTRATI',
    'nav.cart': 'Carrello',
    // Announcement
    'announce.shipping': 'Spedizione gratuita per ordini superiori a €50',
    'announce.new_stores': 'Nuovi negozi ogni settimana',
    'announce.discount': 'Registrati e ottieni il 10% di sconto sul primo ordine',
    // Cart
    'cart.title': 'CARRELLO',
    'cart.empty': 'IL CARRELLO È VUOTO',
    'cart.browse': 'SFOGLIA I NEGOZI',
    'cart.subtotal': 'Subtotale',
    'cart.checkout': 'PROCEDI AL CHECKOUT',
    'cart.continue': 'CONTINUA GLI ACQUISTI',
    // Checkout
    'checkout.title': 'CHECKOUT',
    'checkout.delivery_address': 'INDIRIZZO DI CONSEGNA',
    'checkout.fullname': 'Nome completo',
    'checkout.phone': 'Numero di telefono',
    'checkout.address': 'Indirizzo',
    'checkout.city': 'Città',
    'checkout.notes': 'Appartamento / Note',
    'checkout.payment_method': 'METODO DI PAGAMENTO',
    'checkout.cod': 'PAGAMENTO ALLA CONSEGNA (CONTANTI)',
    'checkout.cod_desc': 'Paga in contanti quando ricevi il tuo ordine',
    'checkout.summary': 'RIEPILOGO ORDINE',
    'checkout.coupon': 'Codice sconto',
    'checkout.apply': 'APPLICA',
    'checkout.remove': 'RIMUOVI',
    'checkout.subtotal': 'Subtotale',
    'checkout.discount': 'Sconto',
    'checkout.loyalty': 'Punti fedeltà',
    'checkout.delivery': 'Spedizione',
    'checkout.free': 'Gratuita',
    'checkout.total': 'TOTALE',
    'checkout.placing': 'ORDINE IN CORSO…',
    'checkout.order_btn': 'ORDINA',
    'checkout.cash_note': '💵 Pagamento contanti alla consegna',
    'checkout.delivery_note': '🕐 Consegna: 2-3 giorni lavorativi',
    'checkout.empty_title': 'IL TUO CARRELLO È VUOTO',
    'checkout.explore': 'ESPLORA I NEGOZI',
    'checkout.invalid_coupon': 'Codice non valido.',
    'checkout.error': 'Ordine fallito. Riprova.',
    // Auth
    'auth.login_title': 'ACCEDI',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login_btn': 'ACCEDI',
    'auth.logging_in': 'ACCESSO IN CORSO…',
    'auth.no_account': 'Non hai un account?',
    'auth.register_link': 'REGISTRATI',
    'auth.have_account': 'Hai già un account?',
    'auth.login_link': 'ACCEDI',
    'auth.register_title': 'REGISTRATI',
    'auth.fullname': 'Nome completo',
    'auth.phone': 'Numero di telefono',
    'auth.confirm_password': 'Conferma password',
    'auth.register_btn': 'REGISTRATI',
    'auth.open_store_btn': 'APRI NEGOZIO',
    'auth.registering': 'REGISTRAZIONE IN CORSO...',
    'auth.as_customer': 'ACQUISTA COME CLIENTE',
    'auth.as_vendor': 'APRI UN NEGOZIO',
    'auth.invalid_login': 'Email o password errati.',
    'auth.vendor_note': "Dopo la registrazione completerai i dettagli del tuo negozio. Recensito entro 24 ore.",
    'auth.required': 'Tutti i campi sono obbligatori.',
    'auth.password_mismatch': 'Le password non corrispondono.',
    'auth.password_short': 'La password deve contenere almeno 8 caratteri.',
    'auth.already_registered': 'Questa email è già registrata.',
    'auth.confirm_email': 'Registrazione completata! Controlla la tua email e conferma il tuo account prima di accedere.',
    'auth.forgot_password': 'Hai dimenticato la password?',
    'auth.forgot_password_title': 'REIMPOSTA PASSWORD',
    'auth.forgot_password_desc': 'Inserisci la tua email e ti invieremo le istruzioni per il ripristino.',
    'auth.send_reset': 'INVIA LINK DI RESET',
    'auth.sending': 'INVIO IN CORSO...',
    'auth.reset_sent': 'Link inviato! Controlla la tua email.',
    'auth.back_to_login': '← Torna al Login',
    'auth.new_password_title': 'NUOVA PASSWORD',
    'auth.new_password': 'Nuova password',
    'auth.update_password': 'AGGIORNA PASSWORD',
    'auth.updating': 'AGGIORNAMENTO...',
    'auth.password_updated': 'Password aggiornata! Reindirizzamento...',
    'auth.invalid_reset': 'Il link di reset non è valido o è scaduto.',
  },
}

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
