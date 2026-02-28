import { useActiveCart } from '@/hooks/use-active-cart'
import { sdk } from '@/lib/sdk'
import { router } from 'expo-router'

export function useCartsViewModel() {
  const { setActiveCartId } = useActiveCart()

  const { isLoading, isError, data } = sdk.v1.$reactQuery.useListCarts({
    params: { order: 'desc' },
  })

  return {
    isLoading,
    isError,
    carts: data?.carts ?? [],
    handlerGoToCreateCart: () =>
      router.replace({
        pathname: 'carts/manage',
        params: { mode: 'create' },
      }),
    handlerSelectCart: (cartId: string) => {
      setActiveCartId(cartId)
      router.back()
    },
  }
}
