import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/queries'
import { CurrencyCode } from '@workspace/db/tenant/enums'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } =
  queries.application.orders.listOrdersWithRelations

export async function listOrders(app: FastifyTypedInstance) {
  app.get(
    '/orders',
    {
      schema: {
        tags: ['Orders'],
        description: 'Get all orders',
        operationId: 'listOrders',
        querystring: z.object({
          search: z.string().optional(),
          filterBy: z.enum(FILTER_BY).optional().default('displayId'),
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
              orders: z.array(
                z.object({
                  id: z.string(),
                  referenceId: z.string().nullable(),
                  displayId: z.number(),
                  sellerId: z.string().nullable(),
                  customerId: z.string().nullable(),
                  paymentMethodId: z.string().nullable(),
                  paymentTermId: z.string().nullable(),
                  carrierId: z.string().nullable(),
                  status: z.string(),
                  currencyCode: z.enum(CurrencyCode),
                  notes: z.string().nullable(),
                  orderItems: z.array(
                    z.object({
                      id: z.string(),
                      referenceId: z.string().nullable(),
                      orderLineItemId: z.string().nullable(),
                      quantity: z.number(),
                      unitPrice: z.number(),
                      compareAtUnitPrice: z.number().nullable(),
                      notes: z.string().nullable(),
                      createdAt: z.date(),
                      updatedAt: z.date(),
                    }),
                  ),
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

      const { count, orders } =
        await tenant.queries.orders.listOrdersWithRelations(
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
        orders,
      }
    },
  )
}
