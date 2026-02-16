import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'

type PriceAdjustmentType = 'discount' | 'surcharge'
type PriceAdjustmentMode = 'fixed' | 'percentage'
type PriceAdjustmentApplyOn = 'unit'

export function usePriceAdjustmentsViewModel() {
  const { productId, variantId, priceListId, price, quantity } =
    useLocalSearchParams()

  const basePrice = Number(price) || 0
  const quantityNumber = Number(quantity) || 1

  const [type, setType] = useState<PriceAdjustmentType>('discount')
  const [mode, setMode] = useState<PriceAdjustmentMode>('fixed')
  const [value, setValue] = useState('')
  const [applyOn] = useState<PriceAdjustmentApplyOn>('unit')

  const numericValue = Number(value) || 0

  const { finalPrice, difference } = useMemo(() => {
    if (numericValue <= 0) {
      return {
        finalPrice: basePrice,
        difference: 0,
      }
    }

    const signal = type === 'discount' ? -1 : 1

    let adjustmentValue = 0

    if (mode === 'fixed') {
      adjustmentValue = numericValue * signal
    }

    if (mode === 'percentage') {
      adjustmentValue = ((basePrice * numericValue) / 100) * signal
    }

    const finalPrice = Math.max(0, basePrice + adjustmentValue)

    return {
      finalPrice,
      difference: Math.abs(adjustmentValue),
    }
  }, [basePrice, type, mode, numericValue])

  return {
    basePrice,

    type,
    setType,

    mode,
    setMode,

    value,
    setValue,

    finalPrice,
    difference,

    handleGoToEditPriceAdjustment() {
      router.dismissTo({
        pathname: 'products/[productId]',
        params: {
          productId,
          variantId,
          priceListId,
          type,
          mode,
          value,
          applyOn,
        },
      })
    },
  }
}
