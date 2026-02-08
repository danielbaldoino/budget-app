import { COLOR_SCHEMES, type ThemeMode } from '@/constants/theme'
import { useColorScheme } from 'nativewind'
import { useEffect } from 'react'
import { useStorage } from './use-storage'

export function useAppearance() {
  const { colorScheme } = useColorScheme()
  const [theme, setTheme] = useStorage<ThemeMode | 'system'>('theme', 'system')

  const activeTheme =
    theme === 'system'
      ? colorScheme === undefined
        ? 'light'
        : colorScheme
      : theme

  const isDarkMode = activeTheme === 'dark'
  const inverseTheme: ThemeMode = isDarkMode ? 'light' : 'dark'

  return {
    isDarkMode,
    theme,
    inverseTheme,
    colors: COLOR_SCHEMES[activeTheme],
    setTheme,
    toggleTheme: () => setTheme(inverseTheme),
  }
}

export function useSyncColorScheme(theme: ThemeMode | 'system') {
  const { setColorScheme } = useColorScheme()

  useEffect(() => setColorScheme(theme), [theme])
}
