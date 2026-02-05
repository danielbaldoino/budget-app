import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { queryClient } from '@/lib/react-query'
import { AppearanceProvider } from './appearance-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider>
        <GestureHandlerRootView>
          <KeyboardProvider>{children}</KeyboardProvider>
        </GestureHandlerRootView>
      </AppearanceProvider>
    </QueryClientProvider>
  )
}
