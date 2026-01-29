import type {
  AddressType as AddressTypeEnum,
  CurrencyCode as CurrencyCodeEnum,
  DocumentType as DocumentTypeEnum,
} from './enums'

export type TechnicalSpecification = {
  code: string
  label: string
  value: string | number | boolean
}

export type ProductVariantCustomField = {
  fieldId: string
  label: string
  value: string | number | boolean
  type: 'string' | 'number' | 'boolean'
}

export type PriceAdjustment = {
  type: 'discount' | 'surcharge'
  mode: 'fixed' | 'percentage'
  value: number
  applyOn: 'unit' | 'item-total' | 'cart-total'
}

type AmountRule =
  | {
      type: 'percentage'
      value: number
      applyOn: 'total' | 'remaining'
    }
  | {
      type: 'remaining'
    }

export type PaymentTermRules = {
  entry?: {
    quantity: number
    schedule: {
      startAfterDays: number
      intervalDays?: number
    }
    amount: AmountRule
  }

  installments: [
    {
      quantity: number
      schedule: {
        startAfterDays: number
        intervalDays?: number
        baseOn: 'base-date' | 'previous-step'
      }
      amount: AmountRule
    },
  ]
}

export type CurrencyCode = (typeof CurrencyCodeEnum)[number]

export type DocumentType = (typeof DocumentTypeEnum)[number]

export type AddressType = (typeof AddressTypeEnum)[number]
