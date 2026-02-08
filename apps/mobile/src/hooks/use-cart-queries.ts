import { HTTP_STATUS } from '@/constants/http'
import { sdk } from '@/lib/sdk'
import { useCallback, useEffect, useMemo } from 'react'
import { useStorage } from './use-storage'

const SELECTED_CART_STORAGE_KEY = 'selected-cart-id'

function useSelectedCart() {
  return useStorage<string>(SELECTED_CART_STORAGE_KEY, '')
}

export function useCurrentCartQuery() {
  const [selectedCartId, setSelectedCartId] = useSelectedCart()

  const hasSelectedCart = Boolean(selectedCartId)

  const { isLoading, data, error } = sdk.v1.$reactQuery.useGetCart(
    { cartId: selectedCartId },
    { query: { enabled: hasSelectedCart } },
  )

  const cart = data?.cart

  const quantityOfItems = useMemo(() => {
    return (
      cart?.cartItems.reduce((total, item) => total + item.quantity, 0) ?? 0
    )
  }, [cart?.cartItems])

  const clearSelectedCart = useCallback(() => {
    setSelectedCartId('')
  }, [setSelectedCartId])

  useEffect(() => {
    if (error?.status === HTTP_STATUS.NOT_FOUND) {
      clearSelectedCart()
    }
  }, [error?.status, clearSelectedCart])

  return {
    isLoading,
    hasSelectedCart,
    cart,
    quantityOfItems,
  }
}
