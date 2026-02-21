import { HTTP_STATUS } from '@/constants/http'
import { sdk } from '@/lib/sdk'
import { useCallback, useEffect } from 'react'
import { useStorage } from './use-storage'

const ACTIVE_CART_ID_STORAGE_KEY = 'active-cart-id'

function useActiveCartId() {
  return useStorage<string>(ACTIVE_CART_ID_STORAGE_KEY, '')
}

export function useActiveCart({ enabled = true }: { enabled?: boolean } = {}) {
  const [activeCartId, setActiveCartId] = useActiveCartId()

  const hasActiveCart = Boolean(activeCartId)

  const { isLoading, data, error, refetch } = sdk.v1.$reactQuery.useGetCart(
    { cartId: activeCartId },
    { query: { enabled: enabled && hasActiveCart } },
  )

  const cart = data?.cart

  const clearActiveCart = useCallback(() => {
    setActiveCartId('')
  }, [setActiveCartId])

  useEffect(() => {
    if (error?.status === HTTP_STATUS.NOT_FOUND) {
      clearActiveCart()
    }
  }, [error?.status, clearActiveCart])

  return {
    isLoading,
    cart,
    refetch,
    setActiveCartId,
  }
}
