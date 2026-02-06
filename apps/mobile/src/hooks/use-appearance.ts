import { COLOR_SCHEMES, type ThemeMode } from '@/constants/theme'
import { useColorScheme } from 'nativewind'
import { useEffect } from 'react'
import { useStorage } from './use-storage'

export function useAppearance() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const [theme, setTheme] = useStorage<ThemeMode | 'system'>('theme', 'system')

  const activeTheme =
    theme === 'system'
      ? colorScheme === null || colorScheme === undefined
        ? 'light'
        : colorScheme
      : theme
  const isDarkMode = activeTheme === 'dark'
  const inverseTheme: ThemeMode = isDarkMode ? 'light' : 'dark'

  const useApplyColorScheme = () =>
    useEffect(() => setColorScheme(theme), [theme])

  return {
    theme,
    isDarkMode,
    inverseTheme,
    setTheme,
    toggleTheme: () => setTheme(inverseTheme),
    useApplyColorScheme,
    colors: COLOR_SCHEMES[activeTheme],
  }
}
