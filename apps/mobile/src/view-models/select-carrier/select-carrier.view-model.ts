import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSelectCarrierViewModel() {
  const { q: search } = useLocalSearchParams<{ q?: string }>()

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useListCarriers({
    params: { search },
  })

  return {
    isLoading,
    isError,
    carriers: data?.carriers ?? [],
    onSearchChange: (text: string) => router.setParams({ q: text }),
    handleCarrierPress: (carrierId: string) =>
      router.dismissTo({
        pathname: 'cart/checkout',
        params: { carrierId },
      }),
  }
}
