import { DEFAULT_LOCALE } from '@/constants/locale'
import { useLocales } from 'expo-localization'

export function useCurrencyCode({
  currencyCode: initialCurrencyCode,
}: { currencyCode?: string } = {}) {
  const [locale] = useLocales()

  const currencyCode =
    initialCurrencyCode ?? locale?.currencyCode ?? DEFAULT_LOCALE.currencyCode

  const toLongPrice = (price?: number | null, currency?: string | null) => {
    if (price === null || price === undefined) {
      return undefined
    }

    const effectiveCurrency = currency ?? currencyCode

    try {
      const formatter = new Intl.NumberFormat(locale?.regionCode ?? undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        currency: effectiveCurrency,
        currencyDisplay: 'symbol',
        style: 'currency',
      })
      return formatter.format(price)
    } catch (_) {
      return undefined
    }
  }

  return {
    currencyCode,
    toLongPrice,
  }
}
