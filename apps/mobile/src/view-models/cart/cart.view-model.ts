import { useAppReady } from '@/hooks/use-app-ready'
import { useCurrentCartQuery } from '@/hooks/use-cart-queries'
import { router, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'

export function useCartViewModel() {
  const { isLoading, cart, hasSelectedCart } = useCurrentCartQuery()
  const segments = useSegments()
  const { isMounted } = useAppReady()
  const [alreadyPushed, setAlreadyPushed] = useState(false)

  const canPushToCarts = !hasSelectedCart && isMounted && !alreadyPushed
  const lastSegment = segments[segments.length - 1]

  const redirectToCarts = () => router.push('carts')

  useEffect(() => {
    if (!canPushToCarts) {
      return
    }
    if (lastSegment === 'cart') {
      redirectToCarts()
    }
    if (lastSegment === 'carts') {
      setAlreadyPushed(true)
    }
  }, [canPushToCarts, lastSegment])

  return {
    isLoading,
    cart,
    redirectToCarts,
  }
}
