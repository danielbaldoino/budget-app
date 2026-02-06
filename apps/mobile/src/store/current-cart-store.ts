import { asyncStorage } from '@/lib/storages/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CurrentCartStore {
  cartId: string
  quantityOfItems: number
  setCartId: (cartId: string) => void
  setQuantityOfItems: (quantity: number) => void
  clear: () => void
}

export const useCurrentCartStore = create<CurrentCartStore>()(
  persist(
    (set) => ({
      cartId: '',
      quantityOfItems: 0,
      setCartId: (cartId: string) => set(() => ({ cartId })),
      setQuantityOfItems: (quantityOfItems: number) =>
        set(() => ({ quantityOfItems })),
      clear: () => set(() => ({ cartId: '', quantityOfItems: 0 })),
    }),
    {
      name: 'current-cart-storage',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
)
