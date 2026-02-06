import { getLocales } from 'expo-localization'
import { I18n } from 'i18n-js'
import { translations } from './translations'

const { languageCode } = getLocales()[0]

export const i18n = new I18n(translations, {
  defaultLocale: 'en',
  enableFallback: true,
  locale: languageCode || undefined,
})
