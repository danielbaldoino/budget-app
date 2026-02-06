import { useAppearance, useSyncColorScheme } from '@/hooks/use-appearance'
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
  const { theme, isDarkMode, inverseTheme, colors } = useAppearance()

  useSyncColorScheme(theme)

  return (
    <ThemeProvider
      value={{ ...(isDarkMode ? DarkTheme : DefaultTheme), colors }}
    >
      <StatusBar style={inverseTheme} />
      {children}
      <Toast useModal={false} />
    </ThemeProvider>
  )
}
