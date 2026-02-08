import { useAppReady } from '@/hooks/use-app-ready'
import { useCurrentCartQuery } from '@/hooks/use-cart-queries'
import { i18n } from '@/lib/languages'
import { router, useSegments } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Share } from 'react-native'

export function useCartViewModel() {
  const { isLoading, cart, hasSelectedCart } = useCurrentCartQuery()
  const segments = useSegments()
  const { isMounted } = useAppReady()
  const [hasRedirectedToCarts, setHasRedirectedToCarts] = useState(false)

  const shouldRedirectToCarts =
    !hasSelectedCart && isMounted && !hasRedirectedToCarts
  const lastSegment = segments[segments.length - 1]

  const redirectToCarts = useCallback(() => {
    router.push('carts')
  }, [])

  const handleShare = () =>
    Share.share({ title: i18n.t('cart.actions.shareCart'), message: '' })

  useEffect(() => {
    if (!shouldRedirectToCarts) {
      return
    }

    if (lastSegment === 'cart') {
      redirectToCarts()
    }

    if (lastSegment === 'carts') {
      setHasRedirectedToCarts(true)
    }
  }, [shouldRedirectToCarts, lastSegment, redirectToCarts])

  return {
    isLoading,
    cart,
    redirectToCarts,
    handleShare,
  }
}
