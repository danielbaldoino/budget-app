import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen'
import { useEffect } from 'react'
import { useAppHydrated } from '@/hooks/use-app-hydrated'

preventAutoHideAsync()

export function SplashScreenController() {
  const { isHydrated } = useAppHydrated()

  useEffect(() => {
    if (isHydrated) {
      hideAsync()
    }
  }, [isHydrated])

  return null
}
