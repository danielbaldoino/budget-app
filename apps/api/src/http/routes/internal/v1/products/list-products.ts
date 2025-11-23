import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { ProductStatus } from '@workspace/db/enums'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } =
  queries.tenant.products.listProductsWithRelations

export async function listProducts(app: FastifyTypedInstance) {
  app.get(
    '/products',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get all workspace products',
        operationId: 'listProducts',
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
              products: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  subtitle: z.string().nullable(),
                  description: z.string().nullable(),
                  status: z.enum(ProductStatus),
                  thumbnailUrl: z.string().url().nullable(),
                  images: z.array(
                    z.object({
                      id: z.string(),
                      url: z.string().url(),
                      rank: z.number().int().nonnegative(),
                      createdAt: z.coerce.date(),
                      updatedAt: z.coerce.date(),
                    }),
                  ),
                  category: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      createdAt: z.coerce.date(),
                      updatedAt: z.coerce.date(),
                    })
                    .nullable(),
                  options: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      values: z.array(
                        z.object({
                          id: z.string(),
                          name: z.string(),
                          createdAt: z.coerce.date(),
                          updatedAt: z.coerce.date(),
                        }),
                      ),
                      createdAt: z.coerce.date(),
                      updatedAt: z.coerce.date(),
                    }),
                  ),
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
      const { tenant } = request.internal

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, products } =
        await queries.tenant.products.listProductsWithRelations(
          { tenant },
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
        products,
      }
    },
  )
}
