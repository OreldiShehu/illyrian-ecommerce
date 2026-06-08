import type { Tables } from './database'

export type User = Tables<'users'>
export type Vendor = Tables<'vendors'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Review = Tables<'reviews'>
export type VendorReview = Tables<'vendor_reviews'>
export type Wishlist = Tables<'wishlists'>
export type Coupon = Tables<'coupons'>
export type VendorPlan = Tables<'vendor_plans'>
export type FeaturedSlot = Tables<'featured_slots'>
export type Notification = Tables<'notifications'>
export type LoyaltyPoint = Tables<'loyalty_points'>
export type CommissionLedger = Tables<'commission_ledger'>
export type EmailSubscriber = Tables<'email_subscribers'>
export type Referral = Tables<'referrals'>
export type ReferralCredit = Tables<'referral_credits'>
export type FlashSale = Tables<'flash_sales'>

// Extended types with joins
export type ProductWithVendor = Product & {
  vendors: Pick<Vendor, 'id' | 'store_name' | 'slug' | 'logo_url' | 'whatsapp' | 'city' | 'is_verified'>
  flash_sales?: FlashSale[]
}

export type VendorWithPlan = Vendor & {
  vendor_plans?: VendorPlan[]
  avg_rating?: number
  review_count?: number
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: Pick<Product, 'id' | 'name' | 'slug' | 'images' | 'price'> | null
    vendors: Pick<Vendor, 'id' | 'store_name' | 'slug' | 'whatsapp'> | null
  })[]
}

export type CartItem = {
  productId: string
  name: string
  price: number
  comparePrice?: number
  image: string
  slug: string
  vendorId: string
  vendorName: string
  quantity: number
  size?: string
  color?: string
  stock: number
}

export type CartState = {
  items: CartItem[]
  coupon: Coupon | null
  loyaltyPointsUsed: number
}

export type CartActions = {
  addItem: (product: Omit<CartItem, 'quantity'>, quantity: number) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  applyLoyaltyPoints: (points: number) => void
  clearCart: () => void
}

export type CartComputed = Record<string, never>

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

export type PaginatedResult<T> = {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export const ALBANIAN_CITIES = [
  'Tiranë',
  'Durrës',
  'Vlorë',
  'Shkodër',
  'Elbasan',
  'Fier',
  'Korçë',
  'Tjetër',
] as const

export type AlbanianCity = (typeof ALBANIAN_CITIES)[number]

export const PRODUCT_CATEGORIES = [
  'Streetwear',
  'Premium Fashion',
  'Luxury Wear',
  'Sportswear',
  'Casual',
  'Formalwear',
  'Accessories',
  'Footwear',
] as const

export const VENDOR_CATEGORIES = [
  'Streetwear',
  'Premium Fashion',
  'Luxury Wear',
  'Sportswear',
  'Casual',
  'Accessories',
  'Mixed',
] as const

export const ORDER_STATUSES = {
  pending: { label: 'Porositur', color: 'text-yellow-600' },
  confirmed: { label: 'Konfirmuar', color: 'text-blue-600' },
  shipped: { label: 'Dërguar', color: 'text-purple-600' },
  delivered: { label: 'Dorëzuar', color: 'text-green-600' },
  cancelled: { label: 'Anuluar', color: 'text-red-600' },
} as const
