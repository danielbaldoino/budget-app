import { router } from 'expo-router'

export function useCartsViewModel() {
  return {
    handlerGoBack: router.back,
    handlerGoToCreateCart: () =>
      router.replace({
        pathname: 'carts/manage',
        params: { mode: 'create' },
      }),
  }
}
