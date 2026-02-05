import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storages/async-storage'

interface CartStore {
  cartId: string | null
  quantityOfItems: number
  setCartId: (cartId: string | null) => void
  setQuantityOfItems: (quantity: number) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartId: null,
      quantityOfItems: 0,
      setCartId: (cartId: string | null) => set(() => ({ cartId })),
      setQuantityOfItems: (quantityOfItems: number) =>
        set(() => ({ quantityOfItems })),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
)
