import { DEFAULT_LANGUAGE } from '@/constants/locale'
import { translations } from '@/constants/translations'
import { getLocales } from 'expo-localization'
import { I18n } from 'i18n-js'

const [{ languageCode }] = getLocales()

export const i18n = new I18n(translations, {
  defaultLocale: DEFAULT_LANGUAGE,
  enableFallback: true,
  locale: languageCode || undefined,
})
