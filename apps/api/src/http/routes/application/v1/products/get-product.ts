import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { productStatusEnum } from '@/utils/schemas'
import { z } from 'zod'

export async function getProduct(app: FastifyTypedInstance) {
  app.get(
    '/products/:productId',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get product details',
        operationId: 'getProduct',
        params: z.object({
          productId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              product: z.object({
                id: z.string(),
                name: z.string(),
                subtitle: z.string().nullable(),
                description: z.string().nullable(),
                status: productStatusEnum,
                thumbnailUrl: z.string().url().nullable(),
                images: z.array(
                  z.object({
                    id: z.string(),
                    url: z.string().url(),
                    rank: z.number().int().nonnegative(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  }),
                ),
                category: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
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
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      }),
                    ),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  }),
                ),
                variants: z.array(
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
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      }),
                    ),
                    options: z.array(
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        option: z.object({
                          id: z.string(),
                          name: z.string(),
                          createdAt: z.date(),
                          updatedAt: z.date(),
                        }),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      }),
                    ),
                    productId: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  }),
                ),
                detail: z
                  .object({
                    id: z.string(),
                    brand: z.string().nullable(),
                    material: z.string().nullable(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
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

      const { productId } = request.params

      const product = await tenant.queries.products.getProductWithRelations({
        tenant: tenant.name,
        productId,
      })

      if (!product) {
        throw new BadRequestError({
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.',
        })
      }

      return {
        product: {
          ...product,
          variants: product.variants.map((variant) => ({
            ...variant,
            options: variant.options.map(({ optionValue }) => ({
              ...optionValue,
              option: optionValue.option,
            })),
          })),
        },
      }
    },
  )
}
