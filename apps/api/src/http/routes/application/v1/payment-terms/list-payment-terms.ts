import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/queries'
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

const { FILTER_BY, SORT_BY, ORDER } =
  queries.application.paymentTerms.listPaymentTerms

export async function listPaymentTerms(app: FastifyTypedInstance) {
  app.get(
    '/payment-terms',
    {
      schema: {
        tags: ['Payment Terms'],
        description: 'Get all payment terms',
        operationId: 'listPaymentTerms',
        querystring: z.object({
          search: z.string().optional(),
          filterBy: z.enum(FILTER_BY).optional().default('name'),
          sortBy: z.enum(SORT_BY).optional().default('createdAt'),
          order: z.enum(ORDER).optional().default('asc'),
          page: z.coerce.number().positive().optional().default(1),
          pageSize: z.coerce
            .number()
            .positive()
            .min(10)
            .max(100)
            .optional()
            .default(50),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              meta: z.object({
                search: z.string().optional(),
                filterBy: z.enum(FILTER_BY),
                sortBy: z.enum(SORT_BY),
                order: z.enum(ORDER),
                count: z.number(),
                page: z.number(),
                pageSize: z.number(),
              }),
              paymentTerms: z.array(
                z.object({
                  id: z.string(),
                  code: z.string(),
                  name: z.string(),
                  rules: PaymentTermRulesSchema.nullable(),
                  active: z.boolean(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                }),
              ),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, paymentTerms } =
        await tenant.queries.paymentTerms.listPaymentTerms(
          { tenant: tenant.name },
          { search, filterBy, sortBy, order, page, pageSize },
        )

      return {
        meta: {
          search,
          filterBy,
          sortBy,
          order,
          count,
          page,
          pageSize,
        },
        paymentTerms,
      }
    },
  )
}
