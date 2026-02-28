import { useActiveCart } from '@/hooks/use-active-cart'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { sdk } from '@/lib/sdk'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'

type CheckoutRouteParams = {
  paymentMethodId?: string
  paymentTermId?: string
  carrierId?: string
}

export function useCheckoutViewModel() {
  const { paymentMethodId, paymentTermId, carrierId } =
    useLocalSearchParams<CheckoutRouteParams>()

  const { isLoading: isCartLoading, cart } = useActiveCart()
  const { toLongPrice } = useCurrencyCode({ currencyCode: cart?.currencyCode })

  const customerId = cart?.customer?.id

  // ---- Customer ----
  const customerQuery = sdk.v1.$reactQuery.useGetCustomer(
    { customerId: customerId ?? '' },
    { query: { enabled: Boolean(customerId) } },
  )

  const customer = customerQuery.data?.customer ?? null

  // ---- Payment Method ----
  const paymentMethodQuery = sdk.v1.$reactQuery.useGetPaymentMethod(
    { paymentMethodId: paymentMethodId ?? '' },
    { query: { enabled: Boolean(paymentMethodId) } },
  )

  const paymentMethod = paymentMethodQuery.data?.paymentMethod ?? null

  // ---- Payment Term ----
  const paymentTermQuery = sdk.v1.$reactQuery.useGetPaymentTerm(
    { paymentTermId: paymentTermId ?? '' },
    { query: { enabled: Boolean(paymentTermId) } },
  )

  const paymentTerm = paymentTermQuery.data?.paymentTerm ?? null

  // ---- Carrier ----
  const carrierQuery = sdk.v1.$reactQuery.useGetCarrier(
    { carrierId: carrierId ?? '' },
    { query: { enabled: Boolean(carrierId) } },
  )

  const carrier = carrierQuery.data?.carrier ?? null

  // ---- Overall State ----
  const isLoading =
    isCartLoading ||
    customerQuery.isLoading ||
    paymentMethodQuery.isLoading ||
    paymentTermQuery.isLoading ||
    carrierQuery.isLoading

  const isError =
    customerQuery.isError ||
    paymentMethodQuery.isError ||
    paymentTermQuery.isError ||
    carrierQuery.isError

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

  const canCheckout =
    cart && customer && paymentMethod && paymentTerm && carrier

  const handleCheckout = () => {
    // Perform checkout action
  }

  return {
    isLoading,
    isError,
    cart,
    customer,
    paymentMethod,
    paymentTerm,
    carrier,
    totalItems,
    totalAmount,
    canCheckout,
    handleGoToSelectPaymentMethod: () =>
      router.push('cart/checkout/select-payment-method'),
    handleGoToSelectPaymentTerm: () =>
      router.push('cart/checkout/select-payment-term'),
    handleGoToSelectCarrier: () => router.push('cart/checkout/select-carrier'),
    handleCheckout,
  }
}
