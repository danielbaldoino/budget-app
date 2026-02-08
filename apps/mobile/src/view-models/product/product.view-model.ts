import { sdk } from '@/lib/sdk'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'

export function useProductViewModel() {
  const { id: productId } = useLocalSearchParams<{ id: string }>()
  const [quantity, setQuantity] = useState(1)

  const { isLoading, data, isError } = sdk.v1.$reactQuery.useGetProduct({
    productId,
  })

  const handleQuantityChange = (newQuantity: number) => setQuantity(newQuantity)

  return {
    isLoading,
    product: data?.product,
    isError,
    quantity,
    handleQuantityChange,
  }
}
