import { VALIDATION } from '@/constants/validation'
import { useActiveCart } from '@/hooks/use-active-cart'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { sdk } from '@/lib/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ProductVariantPrice } from './_lib/types'

type ProductRouteParams = {
  productId: string
  variantId?: string
  priceListId?: string
}

const productFormSchema = z.object({
  notes: z
    .string()
    .max(VALIDATION.MAX_INPUT_LENGTH, 'Notes must be at most 255 characters')
    .optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export function useProductViewModel() {
  const { productId, variantId, priceListId } =
    useLocalSearchParams<ProductRouteParams>()

  if (!productId) {
    throw new Error('productId is required')
  }

  const { cart, isLoading: isCartLoading } = useActiveCart()

  const [quantity, setQuantity] = useState<number>(VALIDATION.DEFAULT_QUANTITY)

  const productQuery = sdk.v1.$reactQuery.useGetProduct({ productId })

  const variantQuery = sdk.v1.$reactQuery.useGetProductVariant(
    { productId, productVariantId: variantId ?? '' },
    { query: { enabled: Boolean(variantId) } },
  )

  const product = productQuery.data?.product
  const variant = variantQuery.data?.productVariant

  const isLoading =
    productQuery.isLoading || variantQuery.isLoading || isCartLoading

  const isError = productQuery.isError || variantQuery.isError

  const existingCartItem = useMemo(() => {
    if (!cart || !variantId) {
      return null
    }

    return (
      cart.cartItems.find((item) => item.productVariant.id === variantId) ??
      null
    )
  }, [cart, variantId])

  useEffect(() => {
    if (!existingCartItem) {
      return
    }

    setQuantity(existingCartItem.quantity)

    const itemPriceListId = existingCartItem.priceList?.id
    if (itemPriceListId && itemPriceListId !== priceListId) {
      router.setParams({ priceListId: itemPriceListId })
    }
  }, [existingCartItem, priceListId])

  useEffect(() => {
    const cartPriceListId = cart?.priceList?.id
    if (!cartPriceListId) {
      return
    }
    if (cartPriceListId === priceListId) {
      return
    }

    router.setParams({ priceListId: cartPriceListId })
  }, [cart?.priceList?.id, priceListId])

  const { currencyCode, toLongPrice } = useCurrencyCode({
    currencyCode: cart?.currencyCode,
  })

  const selectedPrice = useMemo<ProductVariantPrice | null>(() => {
    if (!variant || !currencyCode) {
      return null
    }

    const matchingPrices = variant.priceSets
      .filter(
        (priceSet) => !priceListId || priceSet.priceListId === priceListId,
      )
      .flatMap((priceSet) => priceSet.prices)
      .filter(
        (price) => price.amount != null && price.currencyCode === currencyCode,
      )

    if (!matchingPrices.length) {
      return null
    }

    return matchingPrices.reduce((lowest, current) =>
      (current.amount ?? 0) < (lowest.amount ?? 0) ? current : lowest,
    )
  }, [variant, currencyCode, priceListId])

  const stockQuantity = useMemo(() => {
    if (!variant) {
      return null
    }

    return (
      variant.inventoryItem?.inventoryLevels.reduce(
        (total, level) => total + level.stockedQuantity,
        0,
      ) ?? null
    )
  }, [variant])

  const hasStock = !variant?.manageInventory || (stockQuantity ?? 0) > 0

  const canAddToCart = Boolean(cart && variant && selectedPrice && hasStock)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      notes: undefined,
    },
  })

  useEffect(() => {
    form.reset({
      notes: existingCartItem?.notes || undefined,
    })
  }, [existingCartItem, form])

  const { mutateAsync: upsertCartItem } = sdk.v1.$reactQuery.useUpsertCartItem()

  const resetState = () => {
    setQuantity(VALIDATION.DEFAULT_QUANTITY)
    router.setParams({ priceListId: undefined })
    form.reset()
  }

  const handleAddToCart = async ({ notes }: ProductFormValues) => {
    if (!canAddToCart || !variant || !cart) {
      return
    }

    await upsertCartItem(
      {
        cartId: cart.id,
        data: {
          productVariantId: variant.id,
          priceListId,
          quantity,
          notes,
        },
      },
      {
        onSuccess: () => {
          notificationAsync(NotificationFeedbackType.Success)
          resetState()
        },
        onError: () => {
          notificationAsync(NotificationFeedbackType.Error)
        },
      },
    )
  }

  return {
    isLoading,
    isError,
    canAddToCart,
    product,
    variant,
    price: selectedPrice,
    stockQuantity,
    quantity,
    setQuantity,
    toLongPrice,
    handleAddToCart: form.handleSubmit(handleAddToCart),
    form: {
      control: form.control,
      formState: form.formState,
    },
  }
}
