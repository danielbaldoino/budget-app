import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/tenant/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } =
  queries.productCategories.listProductCategories

export async function listProductCategories(app: FastifyTypedInstance) {
  app.get(
    '/product-categories',
    {
      schema: {
        tags: ['Product Categories'],
        summary: 'Get all workspace product categories',
        operationId: 'listProductCategories',
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
              productCategories: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  description: z.string().nullable(),
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

      const { count, productCategories } =
        await tenant.queries.productCategories.listProductCategories(
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
        productCategories,
      }
    },
  )
}
