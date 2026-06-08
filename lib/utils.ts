export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ë/g, 'e')
    .replace(/ä/g, 'a')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('sq-AL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('sq-AL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function generateOrderNumber(id: string): string {
  return `AL-${id.slice(0, 8).toUpperCase()}`
}

export function calculateFlashPrice(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100)
}

export function isFlashSaleActive(flashSale: { starts_at: string; ends_at: string; is_active: boolean }): boolean {
  const now = new Date()
  return (
    flashSale.is_active &&
    new Date(flashSale.starts_at) <= now &&
    new Date(flashSale.ends_at) > now
  )
}

export function getFlashSaleTimeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return '00:00:00'

  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function getDeliveryFee(subtotal: number): number {
  return subtotal >= 50 ? 0 : 3
}

export function calculateLoyaltyPoints(orderTotal: number): number {
  return Math.floor(orderTotal)
}

export function loyaltyPointsToEuros(points: number): number {
  return points * 0.01
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}…`
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
