import '@/styles/global.css'
import type { Theme } from '@react-navigation/native'
import { mix } from 'polished'

/**
 * The available theme modes in the application.
 */
export type ThemeMode = 'light' | 'dark'

const COLOR_PALETTES: Record<ThemeMode, Record<string, string>> = {
  light: {
    background: '#f9f9f9',
    foreground: '#202020',
    card: '#fcfcfc',
    cardForeground: '#202020',
    popover: '#fcfcfc',
    popoverForeground: '#202020',
    primary: '#644a40',
    primaryForeground: '#ffffff',
    secondary: '#ffdfb5',
    secondaryForeground: '#582d1d',
    muted: '#efefef',
    mutedForeground: '#646464',
    accent: '#e8e8e8',
    accentForeground: '#202020',
    destructive: '#e54d2e',
    destructiveForeground: '#ffffff',
    border: '#d8d8d8',
    input: '#d8d8d8',
    ring: '#644a40',
    radius: '0.5rem',
    chart1: '#644a40',
    chart2: '#ffdfb5',
    chart3: '#e8e8e8',
    chart4: '#ffe6c4',
    chart5: '#66493e',
  },
  dark: {
    background: '#111111',
    foreground: '#eeeeee',
    card: '#191919',
    cardForeground: '#eeeeee',
    popover: '#191919',
    popoverForeground: '#eeeeee',
    primary: '#ffe0c2',
    primaryForeground: '#081a1b',
    secondary: '#393028',
    secondaryForeground: '#ffe0c2',
    muted: '#222222',
    mutedForeground: '#b4b4b4',
    accent: '#2a2a2a',
    accentForeground: '#eeeeee',
    destructive: '#e54d2e',
    destructiveForeground: '#ffffff',
    border: '#201e18',
    input: '#484848',
    ring: '#ffe0c2',
    radius: '0.5rem',
    chart1: '#ffe0c2',
    chart2: '#393028',
    chart3: '#2a2a2a',
    chart4: '#42382e',
    chart5: '#ffe0c1',
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
