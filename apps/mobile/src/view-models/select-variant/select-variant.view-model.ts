import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSelectVariantViewModel() {
  const { productId, q: search } = useLocalSearchParams<{
    productId: string
    q?: string
  }>()

  const { isLoading, isError, data } =
    sdk.v1.$reactQuery.useListProductVariants({
      productId,
      params: {
        search,
      },
    })

  return {
    isLoading,
    isError,
    variants: data?.productVariants ?? [],
    onSearchChange: (text: string) => router.setParams({ q: text }),
    handleVariantPress: (variantId: string) =>
      router.dismissTo({
        pathname: 'products/[productId]',
        params: { productId, variantId },
      }),
  }
}
