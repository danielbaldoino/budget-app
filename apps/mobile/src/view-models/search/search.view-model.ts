import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSearchViewModel() {
  const { q: search } = useLocalSearchParams<{ q?: string }>()

  const { isLoading, data, error } = sdk.v1.$reactQuery.useListProducts({
    params: { search },
  })

  const handleSearch = (text: string) => router.setParams({ q: text })

  return {
    handleSearch,
    isLoading,
    data,
    errorMessage: error?.message,
  }
}
