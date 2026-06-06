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

      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      get discount() {
        const { coupon, subtotal } = get()
        if (!coupon) return 0
        if (subtotal < coupon.min_order) return 0
        if (coupon.discount_type === 'fixed') return Math.min(coupon.discount_value, subtotal)
        return (subtotal * coupon.discount_value) / 100
      },

      get loyaltyDiscount() {
        return loyaltyPointsToEuros(get().loyaltyPointsUsed)
      },

      get deliveryFee() {
        const { subtotal, discount } = get()
        return getDeliveryFee(subtotal - discount)
      },

      get total() {
        const { subtotal, discount, loyaltyDiscount, deliveryFee } = get()
        return Math.max(0, subtotal - discount - loyaltyDiscount + deliveryFee)
      },

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'zazas-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
)
