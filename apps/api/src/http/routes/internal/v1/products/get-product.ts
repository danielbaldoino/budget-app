import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { ProductStatus } from '@workspace/db/enums'
import { queries } from '@workspace/db/queries'
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
                    productId: z.string(),
                    createdAt: z.coerce.date(),
                    updatedAt: z.coerce.date(),
                  }),
                ),
                detail: z
                  .object({
                    id: z.string(),
                    purchaseCurrencyCode: z.string().nullable(),
                    purchaseAmount: z.number().nonnegative().nullable(),
                    brand: z.string().nullable(),
                    material: z.string().nullable(),
                    createdAt: z.coerce.date(),
                    updatedAt: z.coerce.date(),
                  })
                  .nullable(),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { productId } = request.params

      const { tenant } = request.internal

      const product = await queries.tenant.products.getProductWithRelations({
        tenant,
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
              ...optionValue!,
              option: optionValue!.option!,
            })),
          })),
          detail: product.detail
            ? {
                ...product.detail,
                purchaseAmount: product.detail.purchaseAmount
                  ? Number(product.detail.purchaseAmount)
                  : null,
              }
            : null,
        },
      }
    },
  )
}
