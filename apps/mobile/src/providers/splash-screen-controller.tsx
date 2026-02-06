import { useAppReady } from '@/hooks/use-app-ready'
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen'
import { useEffect } from 'react'

preventAutoHideAsync()

export function SplashScreenController() {
  const { isAppReady } = useAppReady()

  useEffect(() => {
    if (isAppReady) {
      hideAsync()
    }
  }, [isAppReady])

  return null
}
