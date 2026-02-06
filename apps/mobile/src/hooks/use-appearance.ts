import { COLOR_SCHEMES, type ThemeMode } from '@/constants/theme'
import { useColorScheme } from 'react-native'
import { useStorage } from './use-storage'

export function useAppearance() {
  const systemColorScheme = useColorScheme()
  const [theme, setTheme] = useStorage<ThemeMode | 'system'>('theme', 'system')

  const activeTheme =
    theme === 'system'
      ? systemColorScheme === null || systemColorScheme === undefined
        ? 'light'
        : systemColorScheme
      : theme
  const isDarkMode = activeTheme === 'dark'
  const inverseTheme: ThemeMode = isDarkMode ? 'light' : 'dark'

  return {
    theme,
    isDarkMode,
    inverseTheme,
    setTheme,
    toggleTheme: () => setTheme(inverseTheme),
    colors: COLOR_SCHEMES[activeTheme],
  }
}
