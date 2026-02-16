import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function usePricingViewModel() {
  const { productId, variantId } = useLocalSearchParams<{
    productId: string
    variantId: string
  }>()

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useGetProductVariant({
    productId,
    productVariantId: variantId,
  })

  return {
    isLoading,
    isError,
    priceSets: data?.productVariant.priceSets || [],
    handlePriceSetPress: (priceListId: string | null) =>
      router.dismissTo({
        pathname: 'products/[productId]',
        params: { productId, variantId, priceListId },
      }),
  }
}
