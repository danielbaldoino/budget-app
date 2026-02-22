import { HTTP_STATUS } from '@/constants/http'
import { sdk } from '@/lib/sdk'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
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

  const clearActiveCart = useCallback(() => {
    setActiveCartId('')
  }, [setActiveCartId])

  useEffect(() => {
    if (error?.status === HTTP_STATUS.NOT_FOUND) {
      clearActiveCart()
    }
  }, [error?.status, clearActiveCart])

  const { mutateAsync: upsertCartItemAsync } =
    sdk.v1.$reactQuery.useUpsertCartItem()
  const { mutateAsync: deleteCartItemAsync } =
    sdk.v1.$reactQuery.useDeleteCartItem()

  const upsertCartItem = async (data: UpsertCartItem) => {
    if (!activeCartId) {
      throw new Error('No active cart')
    }

    await upsertCartItemAsync(
      { cartId: activeCartId, data },
      {
        onSuccess: async () => {
          notificationAsync(NotificationFeedbackType.Success)

          await refetch()
        },
        onError: () => {
          notificationAsync(NotificationFeedbackType.Error)
        },
      },
    )
  }

  const deleteCartItem = async (cartItemId: string) => {
    if (!activeCartId) {
      throw new Error('No active cart')
    }

    await deleteCartItemAsync(
      { cartId: activeCartId, cartItemId },
      {
        onSuccess: async () => {
          notificationAsync(NotificationFeedbackType.Success)

          await refetch()
        },
        onError: () => {
          notificationAsync(NotificationFeedbackType.Error)
        },
      },
    )
  }

  return {
    isLoading,
    cart: data?.cart,
    refetch,
    setActiveCartId,
    upsertCartItem,
    deleteCartItem,
  }
}

type UpsertCartItem = Parameters<typeof sdk.v1.upsertCartItem>[0]['data']
