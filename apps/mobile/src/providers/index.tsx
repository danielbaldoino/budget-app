import { queryClient } from '@/lib/react-query'
import { SplashScreenController } from '@/providers/splash-screen-controller'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { AppearanceProvider } from './appearance-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider>
        <SplashScreenController />
        <GestureHandlerRootView>
          <KeyboardProvider>{children}</KeyboardProvider>
        </GestureHandlerRootView>
      </AppearanceProvider>
    </QueryClientProvider>
  )
}
