import { COLOR_SCHEMES, type ThemeMode } from '@/constants/theme'
import { useColorScheme } from 'nativewind'
import { useCallback, useEffect, useMemo } from 'react'
import { useStorage } from './use-storage'

const THEME_STORAGE_KEY = 'theme'
const SYSTEM_THEME = 'system' as const

type ThemePreference = ThemeMode | typeof SYSTEM_THEME

export function useAppearance() {
  const { colorScheme } = useColorScheme()

  const [themePreference, setThemePreference] = useStorage<ThemePreference>(
    THEME_STORAGE_KEY,
    SYSTEM_THEME,
  )

  const activeTheme: ThemeMode = useMemo(() => {
    if (themePreference !== SYSTEM_THEME) {
      return themePreference
    }

    return colorScheme ?? 'light'
  }, [themePreference, colorScheme])

  const isDarkMode = activeTheme === 'dark'

  const inverseTheme: ThemeMode = isDarkMode ? 'light' : 'dark'

  const toggleTheme = useCallback(() => {
    setThemePreference(inverseTheme)
  }, [inverseTheme, setThemePreference])

  return {
    themePreference,
    activeTheme,
    isDarkMode,
    inverseTheme,
    colors: COLOR_SCHEMES[activeTheme],
    setThemePreference,
    toggleTheme,
  }
}

export function useApplyTheme(theme: ThemePreference) {
  const { setColorScheme } = useColorScheme()

  useEffect(() => {
    setColorScheme(theme)
  }, [theme, setColorScheme])
}
