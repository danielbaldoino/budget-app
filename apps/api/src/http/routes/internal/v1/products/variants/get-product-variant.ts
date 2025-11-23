import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

export async function getProductVariant(app: FastifyTypedInstance) {
  app.get(
    '/products/:productId/variants/:productVariantId',
    {
      schema: {
        tags: ['Product Variants'],
        summary: 'Get product variant details',
        operationId: 'getProductVariant',
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              productVariant: z.object({
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
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { productId, productVariantId } = request.params

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

      const productVariant =
        await queries.tenant.products.variants.getProductVariantWithRelations({
          tenant,
          productId,
          productVariantId,
        })

      if (!productVariant) {
        throw new BadRequestError({
          code: 'VARIANT_NOT_FOUND',
          message: 'Variant not found.',
        })
      }

      const price = productVariant.priceSet?.prices[0]

      return {
        productVariant: {
          ...productVariant,
          options: productVariant.options.map(({ optionValue }) => ({
            ...optionValue!,
            option: optionValue!.option!,
          })),
          currencyCode: price?.currencyCode ?? null,
          amount: price?.amount ? Number(price?.amount) : null,
        },
      }
    },
  )
}
