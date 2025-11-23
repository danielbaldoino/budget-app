import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } =
  queries.tenant.products.variants.listProductVariantsWithRelations

export async function listProductVariants(app: FastifyTypedInstance) {
  app.get(
    '/products/:productId/variants',
    {
      schema: {
        tags: ['Product Variants'],
        summary: 'Get variants of a product',
        operationId: 'listProductVariants',
        params: z.object({
          productId: z.string(),
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
              productVariants: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  sku: z.string().nullable(),
                  manageInventory: z.boolean(),
                  thumbnail: z.string().url().nullable(),
                  images: z.array(
                    z.object({
                      id: z.string(),
                      url: z.string().url(),
                      rank: z.number().int().nonnegative(),
                      createdAt: z.coerce.date(),
                      updatedAt: z.coerce.date(),
                    }),
                  ),
                  options: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      option: z.object({
                        id: z.string(),
                        name: z.string(),
                        createdAt: z.coerce.date(),
                        updatedAt: z.coerce.date(),
                      }),
                      createdAt: z.coerce.date(),
                      updatedAt: z.coerce.date(),
                    }),
                  ),
                  currencyCode: z.string().nullable(),
                  amount: z.number().nonnegative().nullable(),
                  productId: z.string(),
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
      const { productId } = request.params

      const { tenant } = request.internal

      const product = await queries.tenant.products.getProduct({
        tenant,
        productId,
      })

      if (!product) {
        throw new BadRequestError({
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.',
        })
      }

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, productVariants } =
        await queries.tenant.products.variants.listProductVariantsWithRelations(
          { tenant, productId },
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
        productVariants: productVariants.map((productVariant) => {
          const price = productVariant.priceSet?.prices[0]

          return {
            ...productVariant,
            options: productVariant.options.map(({ optionValue }) => ({
              ...optionValue!,
              option: optionValue!.option!,
            })),
            currencyCode: price?.currencyCode ?? null,
            amount: price?.amount ? Number(price?.amount) : null,
          }
        }),
      }
    },
  )
}
