import '@/styles/global.css'
import type { Theme } from '@react-navigation/native'
import { mix } from 'polished'

/**
 * The available theme modes in the application.
 */
export type ThemeMode = 'light' | 'dark'

const COLOR_PALETTES: Record<ThemeMode, Record<string, string>> = {
  light: {
    background: '#f8f5ee',
    foreground: '#2a332b',
    card: '#f8f5ee',
    cardForeground: '#402622',
    popover: '#f8f5ee',
    popoverForeground: '#402622',
    primary: '#307b34',
    primaryForeground: '#ffffff',
    secondary: '#e9f6ea',
    secondaryForeground: '#19601f',
    muted: '#efead4',
    mutedForeground: '#5f6561',
    accent: '#cae8cb',
    accentForeground: '#19601f',
    destructive: '#c52c2a',
    destructiveForeground: '#ffffff',
    border: '#d7d7d7',
    input: '#dfd6c9',
    ring: '#307b34',
    chart1: '#4dae50',
    chart2: '#3d8f40',
    chart3: '#307b34',
    chart4: '#19601f',
    chart5: '#09200b',
  },
  dark: {
    background: '#253528',
    foreground: '#c7ccc7',
    card: '#303f32',
    cardForeground: '#c7ccc7',
    popover: '#2b3a2c',
    popoverForeground: '#efead4',
    primary: '#4dae50',
    primaryForeground: '#f4fff4',
    secondary: '#3c493b',
    secondaryForeground: '#d7e2d6',
    muted: '#213023',
    mutedForeground: '#939f95',
    accent: '#3d8f40',
    accentForeground: '#efead4',
    destructive: '#c52c2a',
    destructiveForeground: '#ffffff',
    border: '#3c493b',
    input: '#3c493b',
    ring: '#4dae50',
    chart1: '#81c984',
    chart2: '#67bb6b',
    chart3: '#4dae50',
    chart4: '#46a04a',
    chart5: '#3d8f40',
  },
}

type ExtendedThemeColors = Theme['colors'] & {
  bgPrimarySubtle: string
  bgPrimaryMuted: string
  txtMuted: string
  txtNotification: string
}

const createThemeColors = (mode: ThemeMode): ExtendedThemeColors => {
  const { background, primary, ...rest } = COLOR_PALETTES[mode]

  return {
    // native theme colors
    background,
    border: rest.border,
    card: rest.card,
    notification: rest.destructive,
    primary,
    text: rest.foreground,

    // extended colors
    bgPrimarySubtle: mix(0.03, primary, background),
    bgPrimaryMuted: mix(0.1, primary, background),
    txtMuted: rest.mutedForeground,
    txtNotification: rest.destructiveForeground,
  }
}

export const COLOR_SCHEMES: Record<ThemeMode, ExtendedThemeColors> = {
  light: createThemeColors('light'),
  dark: createThemeColors('dark'),
}

export const ICON_SIZES = {
  smaller: 14,
  small: 20,
  large: 36,
  larger: 48,
} as const
