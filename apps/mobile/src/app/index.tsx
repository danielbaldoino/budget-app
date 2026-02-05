import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import { useAppHydrated } from '@/hooks/use-app-hydrated'
import { useSession } from '@/hooks/use-session'

export default function AppEntry() {
  const { isHydrated } = useAppHydrated()
  const { isAuthenticated } = useSession()
  const [mounted, setMounted] = useState(false)

  const isReady = isHydrated && mounted

  const redirectUser = () =>
    router.replace(isAuthenticated ? '/(main)' : '/(auth)')

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (isReady) {
      redirectUser()
    }
  }, [isReady, isAuthenticated])

  return (
    <View className="flex-1 items-center justify-center bg-muted">
      <Image
        source={require('@/assets/splash-icon.png')}
        className="size-64 object-contain"
      />
    </View>
  )
}
