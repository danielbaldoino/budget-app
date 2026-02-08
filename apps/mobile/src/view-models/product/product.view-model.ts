import { VALIDATION } from '@/constants/validation'
import { sdk } from '@/lib/sdk'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'

export function useProductViewModel() {
  const { id: productId } = useLocalSearchParams<{ id: string }>()
  const [quantity, setQuantity] = useState<number>(VALIDATION.DEFAULT_QUANTITY)

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useGetProduct({
    productId,
  })

  return {
    isLoading,
    isError,
    product: data?.product,
    quantity,
    handleQuantityChange: setQuantity,
  }
}
