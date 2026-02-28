import { useActiveCart } from '@/hooks/use-active-cart'
import { useAppReady } from '@/hooks/use-app-ready'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { i18n } from '@/lib/languages'
import { router, useSegments } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Share } from 'react-native'

export function useCartViewModel() {
  const { hasActiveCart, isLoading, cart, deleteCartItem } = useActiveCart()
  const segments = useSegments()
  const { isMounted } = useAppReady()
  const { toLongPrice } = useCurrencyCode({ currencyCode: cart?.currencyCode })
  const [hasRedirectedToCarts, setHasRedirectedToCarts] = useState(false)

  const shouldRedirectToCarts =
    !hasActiveCart && isMounted && !hasRedirectedToCarts
  const lastSegment = segments[segments.length - 1]

  const redirectToCarts = () => router.push('carts')

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
  }, [shouldRedirectToCarts, lastSegment])

  const totalItems = useMemo(() => {
    if (!cart?.cartItems?.length) {
      return 0
    }

    return cart.cartItems.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart?.cartItems])

  const totalAmountValue = useMemo(() => {
    const items = cart?.cartItems
    if (!items?.length) {
      return 0
    }

    return items.reduce((acc, item) => {
      const amount = item.productVariant.priceSets[0]?.prices[0]?.amount ?? 0

      return acc + amount * item.quantity
    }, 0)
  }, [cart?.cartItems])

  const totalAmount = useMemo(
    () => toLongPrice(totalAmountValue),
    [totalAmountValue, toLongPrice],
  )

  const handleShare = () =>
    Share.share({ title: i18n.t('cart.actions.shareCart'), message: '' })

  const handleDeleteCartItem = (cartItemId: string) =>
    Alert.alert(
      i18n.t('cart.actions.removeItem'),
      i18n.t('cart.messages.confirmRemoveItem'),
      [
        {
          text: i18n.t('common.actions.cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('common.actions.remove'),
          style: 'destructive',
          onPress: () => deleteCartItem(cartItemId),
        },
      ],
    )

  return {
    isLoading,
    cart,
    totalItems,
    totalAmount,
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
    handleGoToSelectCustomer: () =>
      router.push({
        pathname: 'cart/select-customer',
        params: { mode: 'cart' },
      }),
    handleGoToCheckout: () => router.push('cart/checkout'),
    handleShare,
    handleDeleteCartItem,
  }
}
