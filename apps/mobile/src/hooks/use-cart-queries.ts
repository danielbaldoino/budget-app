import { sdk } from '@/lib/sdk'
import { useEffect, useMemo } from 'react'
import { useStorage } from './use-storage'

function useSelectedCart() {
  return useStorage<string>('selected-cart-id', '')
}

export function useCurrentCartQuery() {
  const [selectedCartId, setSelectedCartId] = useSelectedCart()

  const hasSelectedCart = Boolean(selectedCartId)

  if (!hasSelectedCart) {
    return {
      isLoading: false,
      cart: undefined,
      hasSelectedCart: false,
      quantityOfItems: 0,
    }
  }

  const { isLoading, data, error } = sdk.v1.$reactQuery.useGetCart({
    cartId: selectedCartId,
  })

  const cart = data?.cart

  const quantityOfItems = useMemo(() => {
    return (
      cart?.cartItems.reduce((total, item) => total + item.quantity, 0) ?? 0
    )
  }, [cart])

  useEffect(() => {
    if (error?.status === 404) {
      setSelectedCartId('')
    }
  }, [error?.status])

  return {
    isLoading,
    cart,
    hasSelectedCart,
    quantityOfItems,
  }
}
