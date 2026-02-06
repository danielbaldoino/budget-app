import { sdk } from '@/lib/sdk'
import { useCartStore } from '@/store/cart-store'

export function useGetCart() {
  const { cartId, quantityOfItems, setCartId, setQuantityOfItems } =
    useCartStore()

  const hasSelectedCart = Boolean(cartId)

  const { isLoading, data, error } = sdk.v1.$reactQuery.useGetCart(
    { cartId },
    { query: { enabled: hasSelectedCart } },
  )

  if (error) {
    // Handle cart not found error
    const { status } = error

    if (status === 404) {
      setCartId('')
      setQuantityOfItems(0)
    }
  }

  const cart = data?.cart

  if (cart) {
    const totalQuantity = cart.cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    )

    if (totalQuantity !== quantityOfItems) {
      setQuantityOfItems(totalQuantity)
    }
  }

  return {
    isLoading,
    cart,
    hasSelectedCart,
    qtyOfItems: quantityOfItems,
  }
}
