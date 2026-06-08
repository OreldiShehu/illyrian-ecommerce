'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Coupon, CartState, CartActions, CartComputed } from '@/types'
import { getDeliveryFee, loyaltyPointsToEuros } from '@/lib/utils'

type CartStore = CartState & CartActions & CartComputed

function buildKey(productId: string, size?: string, color?: string): string {
  return [productId, size ?? '', color ?? ''].join('|')
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      loyaltyPointsUsed: 0,

      addItem(product, quantity) {
        const key = buildKey(product.productId, product.size, product.color)
        set((state) => {
          const existing = state.items.find(
            (i) =>
              buildKey(i.productId, i.size, i.color) === key
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                buildKey(i.productId, i.size, i.color) === key
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...product, quantity }] }
        })
      },

      removeItem(productId, size, color) {
        const key = buildKey(productId, size, color)
        set((state) => ({
          items: state.items.filter(
            (i) => buildKey(i.productId, i.size, i.color) !== key
          ),
        }))
      },

      updateQuantity(productId, quantity, size, color) {
        const key = buildKey(productId, size, color)
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            buildKey(i.productId, i.size, i.color) === key
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        }))
      },

      applyCoupon(coupon) {
        set({ coupon })
      },

      removeCoupon() {
        set({ coupon: null })
      },

      applyLoyaltyPoints(points) {
        set({ loyaltyPointsUsed: points })
      },

      clearCart() {
        set({ items: [], coupon: null, loyaltyPointsUsed: 0 })
      },

    }),
    {
      name: 'mio-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
)

export const selectSubtotal = (s: CartStore) =>
  s.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export const selectDiscount = (s: CartStore) => {
  const subtotal = selectSubtotal(s)
  if (!s.coupon) return 0
  if (subtotal < s.coupon.min_order) return 0
  if (s.coupon.discount_type === 'fixed') return Math.min(s.coupon.discount_value, subtotal)
  return (subtotal * s.coupon.discount_value) / 100
}

export const selectLoyaltyDiscount = (s: CartStore) =>
  loyaltyPointsToEuros(s.loyaltyPointsUsed)

export const selectDeliveryFee = (s: CartStore) =>
  getDeliveryFee(selectSubtotal(s) - selectDiscount(s))

export const selectTotal = (s: CartStore) =>
  Math.max(0, selectSubtotal(s) - selectDiscount(s) - selectLoyaltyDiscount(s) + selectDeliveryFee(s))

export const selectItemCount = (s: CartStore) =>
  s.items.reduce((sum, item) => sum + item.quantity, 0)
