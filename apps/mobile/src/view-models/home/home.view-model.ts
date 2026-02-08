import { sdk } from '@/lib/sdk'

export function useHomeViewModel() {
  const recentProductsQuery = sdk.v1.$reactQuery.useListProducts({
    params: { pageSize: 6 },
  })

  return {
    recentProducts: {
      isLoading: recentProductsQuery.isLoading,
      isError: recentProductsQuery.isError,
      products: recentProductsQuery.data?.products ?? [],
    },
  }
}
