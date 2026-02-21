export type AddressType = 'billing' | 'shipping'

export type CurrencyCode = 'BRL' | 'USD' | 'EUR'

export type DocumentType = 'cpf' | 'cnpj' | 'foreign'

export type Gender = 'male' | 'female'

export type OrderStatus = 'active' | 'cancelled'

export type ProductStatus = 'active' | 'inactive'

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
