import { queries } from '@petshop/db/queries'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { internalMiddleware } from '@/http/middlewares/internal'
import { BearerAuth } from '@/types/auth'

const { FILTER_BY, SORT_BY, ORDER } =
  queries.internal.stockLocations.listStockLocations

export async function listStockLocations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(internalMiddleware)
    .get(
      '/workspaces/:slug/stock-locations',
      {
        schema: {
          tags: ['[Internal] Stock Locations'],
          summary: 'Get all stock locations',
          operationId: 'listStockLocations',
          security: [{ [BearerAuth.INTERNAL]: [] }],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            search: z.string().optional(),
            filterBy: z.enum(FILTER_BY).optional().default('all'),
            sortBy: z.enum(SORT_BY).optional().default('createdAt'),
            order: z.enum(ORDER).optional().default('desc'),
            page: z.coerce.number().positive().optional().default(1),
            pageSize: z.coerce.number().min(10).max(100).optional().default(50),
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
                stockLocations: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    createdAt: z.coerce.date(),
                    updatedAt: z.coerce.date(),
                  }),
                ),
              })
              .describe('Success'),
          }),
        },
      },
      async (request) => {
        const { slug } = request.params

        const { tenant } = await request.internal.getCurrentUser(slug)

        const { search, filterBy, sortBy, order, page, pageSize } =
          request.query

        const { count, stockLocations } =
          await queries.internal.stockLocations.listStockLocations(
            { tenant },
            {
              search,
              filterBy,
              sortBy,
              order,
              page,
              pageSize,
            },
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
          stockLocations,
        }
      },
    )
}
