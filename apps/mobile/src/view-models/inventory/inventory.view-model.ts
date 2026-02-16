import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useInventoryViewModel() {
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
    inventoryLevels: data?.productVariant.inventoryItem?.inventoryLevels || [],
    handlerGoBack: router.back,
  }
}
