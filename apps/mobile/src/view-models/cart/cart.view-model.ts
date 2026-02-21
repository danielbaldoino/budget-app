import { useActiveCart } from '@/hooks/use-active-cart'
import { useAppReady } from '@/hooks/use-app-ready'
import { i18n } from '@/lib/languages'
import { router, useSegments } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Share } from 'react-native'

export function useCartViewModel() {
  const { isLoading, cart } = useActiveCart()
  const [segments] = useSegments()
  const { isMounted } = useAppReady()
  const [hasRedirectedToCarts, setHasRedirectedToCarts] = useState(false)

  const shouldRedirectToCarts = cart && isMounted && !hasRedirectedToCarts
  const lastSegment = segments[segments.length - 1]

  const redirectToCarts = useCallback(() => {
    router.push('carts')
  }, [])

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

  const handleShare = () => {
    Share.share({ title: i18n.t('cart.actions.shareCart'), message: '' })
  }

  return {
    isLoading,
    cart,
    handleGoToCarts: redirectToCarts,
    handleGoToCreateCart: () =>
      router.push({
        pathname: 'carts/manage',
        params: { mode: 'create' },
      }),
    handleGoToEditCart: () =>
      router.push({
        pathname: 'carts/manage',
        params: { mode: 'edit' },
      }),
    handleGoToCheckout: () => router.push('checkout'),
    handleShare,
  }
}
