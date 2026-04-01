"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  manufacturer: string
  genericName?: string
  category?: string
  price: number
  discountedPrice: number | null
  requiresPrescription: boolean
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id)
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i
            ),
          })
        }
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (acc, item) => acc + (item.discountedPrice ?? item.price) * item.quantity,
          0
        ),
    }),
    {
      name: 'altruist-cart-storage',
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' 
          ? localStorage 
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {}
            }
      )
    }
  )
)
