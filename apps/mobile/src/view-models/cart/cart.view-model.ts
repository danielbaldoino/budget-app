import { useGetCart } from '@/hooks/use-cart-queries'
import { useMounted } from '@/hooks/use-mounted'
import { router, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'

export function useCartViewModel() {
  const { isLoading, cart, cartId } = useGetCart()
  const segments = useSegments()
  const { isMounted } = useMounted()
  const [alreadyPushed, setAlreadyPushed] = useState(false)

  const canPushToCarts = !cartId && isMounted && !alreadyPushed
  const lastSegment = segments[segments.length - 1]

  const redirectToCarts = () => {
    router.push('cart/carts')
  }

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
