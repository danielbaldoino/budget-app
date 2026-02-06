import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSearchViewModel() {
  const { q: search } = useLocalSearchParams<{ q?: string }>()

  const { isLoading, data, error } = sdk.v1.$reactQuery.useListProducts({
    params: { search },
  })

  const onSearchChange = (text: string) => router.setParams({ q: text })

  return {
    onSearchChange,
    isLoading,
    data,
    errorMessage: error?.message,
  }
}
