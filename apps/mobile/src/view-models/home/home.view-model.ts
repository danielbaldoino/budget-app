import { sdk } from '@/lib/sdk'

export function useHomeViewModel() {
  const recentProducts = sdk.v1.$reactQuery.useListProducts({
    params: { pageSize: 6 },
  })

  return {
    recentProducts: {
      isLoading: recentProducts.isLoading,
      products: recentProducts.data?.products ?? [],
      isError: recentProducts.isError,
    },
  }
}
