import { useAppReady } from '@/hooks/use-app-ready'
import { useSession } from '@/hooks/use-session'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Image, View } from 'react-native'

export default function AppEntry() {
  const { isAppReady } = useAppReady()
  const { isAuthenticated } = useSession()

  const redirectUser = () =>
    router.replace(isAuthenticated ? '/(main)' : '/(auth)')

  useEffect(() => {
    if (isAppReady) {
      redirectUser()
    }
  }, [isAppReady, isAuthenticated])

  return (
    <View className="flex-1 items-center justify-center bg-muted">
      <Image
        source={require('@/assets/splash-icon.png')}
        className="size-64 object-contain"
      />
    </View>
  )
}
