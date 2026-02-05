import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { colorScheme } from 'nativewind'
import { useEffect } from 'react'
import ToastManager from 'toastify-react-native/components/ToastManager'
import { useAppearance } from '@/hooks/use-appearance'

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, isDarkMode, inverseTheme, colors } = useAppearance()

  useEffect(() => colorScheme.set(theme), [theme])

  return (
    <ThemeProvider
      value={{
        ...(isDarkMode ? DarkTheme : DefaultTheme),
        colors,
      }}
    >
      <StatusBar style={inverseTheme} />
      {children}
      <ToastManager useModal={false} position="bottom" />
    </ThemeProvider>
  )
}
