import { SplashScreenController } from '@/components/layout/splash-screen-controller'
import { useSession } from '@/hooks/use-session'
import { Providers } from '@/providers'
import { PortalHost } from '@rn-primitives/portal'
import { Stack } from 'expo-router'

function RootNavigator() {
  const { isAuthenticated } = useSession()

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ animation: 'fade', headerShown: false }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <Providers>
      <SplashScreenController />
      <RootNavigator />
      <PortalHost />
    </Providers>
  )
}
