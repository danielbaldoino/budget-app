import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSelectPaymentMethodViewModel() {
  const { q: search } = useLocalSearchParams<{ q?: string }>()

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useListPaymentMethods(
    { params: { search } },
  )

  return {
    isLoading,
    isError,
    paymentMethods: data?.paymentMethods ?? [],
    onSearchChange: (text: string) => router.setParams({ q: text }),
    handlePaymentMethodPress: (paymentMethodId: string) =>
      router.dismissTo({
        pathname: 'cart/checkout',
        params: { paymentMethodId },
      }),
  }
}
