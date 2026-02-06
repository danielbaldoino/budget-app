import { useAppHydrated } from '@/hooks/use-app-hydrated'
import { useMounted } from '@/hooks/use-mounted'
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen'
import { useEffect } from 'react'

preventAutoHideAsync()

export function SplashScreenController() {
  const { isHydrated } = useAppHydrated()
  const { isMounted } = useMounted()

  const isReady = isHydrated && isMounted

  useEffect(() => {
    if (isReady) {
      hideAsync()
    }
  }, [isReady])

  return null
}
