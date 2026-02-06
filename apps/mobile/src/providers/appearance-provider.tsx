import { useAppearance } from '@/hooks/use-appearance'
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
  const { isDarkMode, inverseTheme, useApplyColorScheme, colors } =
    useAppearance()

  useApplyColorScheme()

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
