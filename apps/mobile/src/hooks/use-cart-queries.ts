import { sdk } from '@/lib/sdk'
import { useCurrentCartStore } from '@/store/current-cart-store'
import { useEffect } from 'react'

export function useCurrentCartQuery() {
  const { cartId, quantityOfItems, ...cartFn } = useCurrentCartStore()

  const hasSelectedCart = Boolean(cartId)

  const { isLoading, data, error } = sdk.v1.$reactQuery.useGetCart(
    { cartId },
    { query: { enabled: hasSelectedCart } },
  )

  const cart = data?.cart

  useEffect(() => {
    if (error?.status === 404) {
      cartFn.clear()
    }
  }, [error])

  useEffect(() => {
    if (!cart) {
      return
    }

    const totalQuantity = cart.cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    )

    if (totalQuantity !== quantityOfItems) {
      cartFn.setQuantityOfItems(totalQuantity)
    }
  }, [cart])

  return {
    isLoading,
    cart,
    hasSelectedCart,
    quantityOfItems,
  }
}
