import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSelectPaymentTermViewModel() {
  const { q: search } = useLocalSearchParams<{ q?: string }>()

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useListPaymentTerms({
    params: { search },
  })

  return {
    isLoading,
    isError,
    paymentTerms: data?.paymentTerms ?? [],
    onSearchChange: (text: string) => router.setParams({ q: text }),
    handlePaymentTermPress: (paymentTermId: string) =>
      router.dismissTo({
        pathname: 'cart/checkout',
        params: { paymentTermId },
      }),
  }
}
