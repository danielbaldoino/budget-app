import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSearchViewModel() {
  const { q: search } = useLocalSearchParams<{ q?: string }>()

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useListProducts({
    params: { search },
  })

  return {
    isLoading,
    isError,
    products: data?.products ?? [],
    onSearchChange: (text: string) => router.setParams({ q: text }),
    handleQrCodePress: () => router.push('scanner'),
  }
}
