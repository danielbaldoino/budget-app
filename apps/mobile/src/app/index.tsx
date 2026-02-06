import { useAppHydrated } from '@/hooks/use-app-hydrated'
import { useMounted } from '@/hooks/use-mounted'
import { useSession } from '@/hooks/use-session'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Image, View } from 'react-native'

export default function AppEntry() {
  const { isHydrated } = useAppHydrated()
  const { isMounted } = useMounted()
  const { isAuthenticated } = useSession()

  const isReady = isHydrated && isMounted

  const redirectUser = () =>
    router.replace(isAuthenticated ? '/(main)' : '/(auth)')

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
