import type { ConfigContext, ExpoConfig } from 'expo/config'

export const APP_CONFIG = {
  NAME: 'Budget App',
  SLUG: 'budget-app-mobile',
  VERSION: '1.0.0',
  SCHEME: 'budgetappmobile',
  BUNDLE_IDENTIFIER: 'com.anonymous.budgetappmobile',
  PACKAGE_NAME: 'com.anonymous.budgetappmobile',
} as const

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_CONFIG.NAME,
  slug: APP_CONFIG.SLUG,
  version: APP_CONFIG.VERSION,
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: APP_CONFIG.SCHEME,
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: APP_CONFIG.BUNDLE_IDENTIFIER,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: APP_CONFIG.PACKAGE_NAME,
    softwareKeyboardLayoutMode: 'pan',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
    'expo-localization',
    'expo-camera',
  ],
})
