import { z } from 'zod'

export const addressTypeEnum = z.enum(['billing', 'shipping'])

export const currencyCodeEnum = z.enum(['BRL', 'USD', 'EUR'])

export const documentTypeEnum = z.enum(['cpf', 'cnpj', 'foreign'])

export const genderEnum = z.enum(['male', 'female'])

export const productStatusEnum = z.enum(['active', 'inactive'])

export const addressSchema = z.object({
  type: addressTypeEnum.nullish(),
  street: z.string().nullish(),
  number: z.string().nullish(),
  complement: z.string().nullish(),
  neighborhood: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string().nullish(),
  zipCode: z.string().nullish(),
  reference: z.string().nullish(),
})

const amountRuleSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('percentage'),
    value: z.number(),
    applyOn: z.enum(['total', 'remaining']),
  }),
  z.object({
    type: z.literal('remaining'),
  }),
])

export const paymentTermRulesSchema = z.object({
  entry: z
    .object({
      quantity: z.number().optional(),
      schedule: z.object({
        startAfterDays: z.number(),
        intervalDays: z.number().optional(),
      }),
      amount: amountRuleSchema,
    })
    .optional(),
  installments: z.array(
    z.object({
      quantity: z.number(),
      schedule: z.object({
        startAfterDays: z.number(),
        intervalDays: z.number().optional(),
        baseOn: z.enum(['base-date', 'previous-step']),
      }),
      amount: amountRuleSchema,
    }),
  ),
})

export const priceAdjustmentSchema = z.object({
  type: z.enum(['discount', 'surcharge']),
  mode: z.enum(['fixed', 'percentage']),
  value: z.number(),
  applyOn: z.enum(['unit', 'item-total', 'cart-total']),
})

const basePriceAdjustmentSchema = priceAdjustmentSchema.omit({
  applyOn: true,
})

export const cartItemPriceAdjustmentSchema = basePriceAdjustmentSchema.extend({
  applyOn: z.enum(['unit', 'item-total']).default('unit'),
})

export const cartPriceAdjustmentSchema = basePriceAdjustmentSchema.extend({
  applyOn: z.literal('cart-total'),
})
