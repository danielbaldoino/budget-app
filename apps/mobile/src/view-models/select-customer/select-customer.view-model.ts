import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'

export function useSelectCustomerViewModel() {
  const { q: search } = useLocalSearchParams<{
    q?: string
  }>()

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useListCustomers({
    params: { search },
  })

  return {
    isLoading,
    isError,
    customers: data?.customers ?? [],
    onSearchChange: (text: string) => router.setParams({ q: text }),
    handlerGoBack: router.back,
    handleCustomerPress: (customerId: string) =>
      router.dismissTo({
        pathname: 'customers/[customerId]',
        params: { customerId },
      }),
  }
}
