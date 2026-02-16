import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { paymentTermRulesSchema } from '@/utils/schemas'
import { queries } from '@workspace/db/tenant/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } = queries.paymentTerms.listPaymentTerms

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
                  rules: paymentTermRulesSchema.nullable(),
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
