import { useActiveCart } from '@/hooks/use-active-cart'
import { sdk } from '@/lib/sdk'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'

export function useSelectCustomerViewModel() {
  const { q: search, mode } = useLocalSearchParams<{
    q?: string
    mode?: 'cart'
  }>()

  const isCartMode = mode === 'cart'

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useListCustomers({
    params: { search },
  })

  const { cart, refetch } = useActiveCart({ enabled: isCartMode })

  const { mutateAsync: updateCart } = sdk.v1.$reactQuery.useUpdateCart()

  return {
    isLoading,
    isError,
    customers: data?.customers ?? [],
    onSearchChange: (text: string) => router.setParams({ q: text }),
    handleCustomerPress: async (customerId: string) => {
      if (isCartMode && cart) {
        await updateCart(
          { cartId: cart.id, data: { customerId } },
          {
            onSuccess: async () => {
              notificationAsync(NotificationFeedbackType.Success)
              await refetch()
              router.back()
            },
            onError: () => {
              notificationAsync(NotificationFeedbackType.Error)
            },
          },
        )
      }
    },
  }
}
