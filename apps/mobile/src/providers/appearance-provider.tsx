import { useAppearance, useApplyTheme } from '@/hooks/use-appearance'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import Toast from 'toastify-react-native'

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { themePreference, isDarkMode, colors } = useAppearance()

  useApplyTheme(themePreference)

  return (
    <ThemeProvider
      value={{ ...(isDarkMode ? DarkTheme : DefaultTheme), colors }}
    >
      <StatusBar />
      {children}
      <Toast useModal={false} />
    </ThemeProvider>
  )
}
