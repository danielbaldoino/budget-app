import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
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
                priceSets: z.array(
                  z.object({
                    id: z.string(),
                    priceListId: z.string().nullable(),
                    prices: z.array(
                      z.object({
                        id: z.string(),
                        currencyCode: z.string().nullable(),
                        amount: z.number().nonnegative().nullable(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      }),
                    ),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  }),
                ),
                inventoryItem: z
                  .object({
                    id: z.string(),
                    inventoryLevels: z.array(
                      z.object({
                        id: z.string(),
                        stockedQuantity: z.number(),
                        location: z.object({
                          id: z.string(),
                          name: z.string(),
                          address: z
                            .object({
                              id: z.string(),
                              street: z.string().nullable(),
                              number: z.string().nullable(),
                              complement: z.string().nullable(),
                              neighborhood: z.string().nullable(),
                              city: z.string().nullable(),
                              state: z.string().nullable(),
                              country: z.string().nullable(),
                              zipCode: z.string().nullable(),
                              reference: z.string().nullable(),
                              createdAt: z.date(),
                              updatedAt: z.date(),
                            })
                            .nullable(),
                          createdAt: z.date(),
                          updatedAt: z.date(),
                        }),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      }),
                    ),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
                productId: z.string(),
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

      const { productId, productVariantId } = request.params

      const product = await tenant.queries.products.getProduct({
        tenant: tenant.name,
        productId,
      })

      if (!product) {
        throw new BadRequestError({
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.',
        })
      }

      const productVariant =
        await tenant.queries.products.variants.getProductVariantWithRelations({
          tenant: tenant.name,
          productId,
          productVariantId,
        })

      if (!productVariant) {
        throw new BadRequestError({
          code: 'VARIANT_NOT_FOUND',
          message: 'Variant not found.',
        })
      }

      return {
        productVariant: {
          ...productVariant,
          options: productVariant.options.map(({ optionValue }) => ({
            ...optionValue,
            option: optionValue.option,
          })),
        },
      }
    },
  )
}
