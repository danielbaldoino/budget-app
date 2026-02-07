import { sdk } from '@/lib/sdk'
import { useLocalSearchParams } from 'expo-router'

export function useProductViewModel() {
  const { id: productId } = useLocalSearchParams<{ id: string }>()

  const { isLoading, data, isError } = sdk.v1.$reactQuery.useGetProduct({
    productId,
  })

  return {
    isLoading,
    product: data?.product,
    isError,
  }
}
