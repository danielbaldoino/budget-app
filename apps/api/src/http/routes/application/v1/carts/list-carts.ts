import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { currencyCodeEnum } from '@/utils/schemas'
import { queries } from '@workspace/db/tenant/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } = queries.carts.listCartsWithRelations

export async function listCarts(app: FastifyTypedInstance) {
  app.get(
    '/carts',
    {
      schema: {
        tags: ['Carts'],
        description: 'Get all carts',
        operationId: 'listCarts',
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
              carts: z.array(
                z.object({
                  id: z.string(),
                  sellerId: z.string().nullable(),
                  customerId: z.string().nullable(),
                  priceListId: z.string().nullable(),
                  name: z.string(),
                  currencyCode: currencyCodeEnum,
                  notes: z.string().nullable(),
                  cartItems: z.array(
                    z.object({
                      id: z.string(),
                      productVariantId: z.string(),
                      quantity: z.number(),
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
      const {
        tenant,
        user: { sellerId },
      } = request.application

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, carts } =
        await tenant.queries.carts.listCartsWithRelations(
          { tenant: tenant.name, sellerId },
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
        carts,
      }
    },
  )
}
