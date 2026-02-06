import { asyncStorage } from '@/lib/storages/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CartStore {
  cartId: string
  quantityOfItems: number
  setCartId: (cartId: string) => void
  setQuantityOfItems: (quantity: number) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartId: '',
      quantityOfItems: 0,
      setCartId: (cartId: string) => set(() => ({ cartId })),
      setQuantityOfItems: (quantityOfItems: number) =>
        set(() => ({ quantityOfItems })),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
)
