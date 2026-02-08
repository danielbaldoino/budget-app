import { router } from 'expo-router'

export function useCartsViewModel() {
  return {
    handlerGoBack: () => router.back(),
  }
}
