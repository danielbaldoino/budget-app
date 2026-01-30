import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

const AmountRuleSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('percentage'),
    value: z.number(),
    applyOn: z.enum(['total', 'remaining']),
  }),
  z.object({
    type: z.literal('remaining'),
  }),
])

export const PaymentTermRulesSchema = z.object({
  entry: z
    .object({
      quantity: z.number().optional(),
      schedule: z.object({
        startAfterDays: z.number(),
        intervalDays: z.number().optional(),
      }),
      amount: AmountRuleSchema,
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
      amount: AmountRuleSchema,
    }),
  ),
})

export async function getPaymentTerm(app: FastifyTypedInstance) {
  app.get(
    '/payment-terms/:paymentTermId',
    {
      schema: {
        tags: ['Payment Terms'],
        summary: 'Get payment term details',
        operationId: 'getPaymentTerm',
        params: z.object({
          paymentTermId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              paymentTerm: z.object({
                id: z.string(),
                code: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                rule: PaymentTermRulesSchema.nullish(),
                active: z.boolean(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { paymentTermId } = request.params

      const paymentTerm = await tenant.queries.paymentTerms.getPaymentTerm({
        tenant: tenant.name,
        paymentTermId,
      })

      if (!paymentTerm) {
        throw new BadRequestError({
          code: 'PAYMENT_TERM_NOT_FOUND',
          message: 'Payment term not found.',
        })
      }

      return { paymentTerm }
    },
  )
}
