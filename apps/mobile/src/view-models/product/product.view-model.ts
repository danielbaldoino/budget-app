import { VALIDATION } from '@/constants/validation'
import { useActiveCart } from '@/hooks/use-active-cart'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { i18n } from '@/lib/languages'
import { sdk } from '@/lib/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { setStringAsync } from 'expo-clipboard'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from 'react-native'
import { z } from 'zod'
import type { ProductVariantPrice } from './_lib/types'

type ProductRouteParams = {
  productId: string
  variantId?: string
  priceListId?: string
  mode?: 'cart'
}

const productFormSchema = z.object({
  notes: z
    .string()
    .max(
      VALIDATION.MAX_INPUT_LENGTH,
      i18n.t('common.validation.notesMaxLength'),
    )
    .optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export function useProductViewModel() {
  const { productId, variantId, priceListId, mode } =
    useLocalSearchParams<ProductRouteParams>()

  if (!productId) {
    throw new Error('productId is required')
  }

  const isCartMode = mode === 'cart'

  const { cart, isLoading: isCartLoading, upsertCartItem } = useActiveCart()

  const [quantity, setQuantity] = useState<number>(VALIDATION.DEFAULT_QUANTITY)

  const productQuery = sdk.v1.$reactQuery.useGetProduct({ productId })

  const product = productQuery.data?.product

  useEffect(() => {
    if (!product?.variants?.length) {
      return
    }

    if (variantId) {
      return
    }

    if (product.variants.length === 1) {
      router.setParams({
        variantId: product.variants[0].id,
      })
    }
  }, [product, variantId])

  const variantQuery = sdk.v1.$reactQuery.useGetProductVariant(
    { productId, productVariantId: variantId ?? '' },
    { query: { enabled: Boolean(variantId) } },
  )

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

  const handleSelectVariantPress = () =>
    router.push({
      pathname: 'products/[productId]/select-variant',
      params: { productId: product?.id },
    })

  const handlePriceCardPress = () =>
    router.push({
      pathname: 'products/[productId]/variants/[variantId]/pricing',
      params: { productId: product?.id, variantId: variant?.id },
    })

  const handleInventoryCardPress = () =>
    router.push({
      pathname: 'products/[productId]/variants/[variantId]/inventory',
      params: { productId: product?.id, variantId: variant?.id },
    })

  const handlePriceSettingsPress = () =>
    router.push({
      pathname: 'price-adjustments',
      params: {
        productId: product?.id,
        variantId: variant?.id,
        p: selectedPrice?.amount || 0,
        q: quantity,
      },
    })

  const handleCopySku = async () => {
    if (!variant?.sku) {
      return
    }

    await setStringAsync(variant.sku)
    Alert.alert(variant.sku, i18n.t('common.messages.copiedToClipboard'))
  }

  // const resetState = () => {
  //   setQuantity(VALIDATION.DEFAULT_QUANTITY)
  //   router.setParams({ priceListId: undefined })
  //   form.reset()
  // }

  const canAddToCart =
    // cart && variant &&
    selectedPrice && hasStock

  const handleAddToCart = async ({ notes }: ProductFormValues) => {
    if (!variant) {
      router.push({
        pathname: 'products/[productId]/select-variant',
        params: { productId: product?.id },
      })
      return
    }

    if (!cart) {
      router.push('/carts')
      return
    }

    if (!canAddToCart) {
      return
    }

    await upsertCartItem({
      productVariantId: variant.id,
      priceListId,
      quantity,
      notes,
    })

    if (existingCartItem) {
      router.back()
    }
  }

  return {
    isLoading,
    isError,
    hasCartItem: Boolean(existingCartItem),
    isCartMode,
    canAddToCart,
    product,
    variant,
    price: selectedPrice,
    stockQuantity,
    quantity,
    setQuantity,
    toLongPrice,
    handleAddToCart: form.handleSubmit(handleAddToCart),
    handleSelectVariantPress,
    handlePriceCardPress,
    handleInventoryCardPress,
    handlePriceSettingsPress,
    handleCopySku,
    form: {
      control: form.control,
      formState: form.formState,
    },
  }
}
