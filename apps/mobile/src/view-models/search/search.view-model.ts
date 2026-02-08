import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSearchViewModel() {
  const { q: search } = useLocalSearchParams<{ q?: string }>()

  const { isLoading, data, isError } = sdk.v1.$reactQuery.useListProducts({
    params: { search },
  })

  const handleQrCodePress = () => router.push('scanner')

  return {
    onSearchChange: (text: string) => router.setParams({ q: text }),
    isLoading,
    products: data?.products ?? [],
    isError,
    handleQrCodePress,
  }
}
