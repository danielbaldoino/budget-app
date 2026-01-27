import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getInventoryItem(app: FastifyTypedInstance) {
  app.get(
    '/products/:productId/variants/:productVariantId/inventory-items/:inventoryItemId',
    {
      schema: {
        tags: ['Inventory Items'],
        summary: 'Get inventory item details',
        operationId: 'getInventoryItem',
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
          inventoryItemId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              inventoryItem: z.object({
                id: z.string(),
                variant: z.object({
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
                  createdAt: z.coerce.date(),
                  updatedAt: z.coerce.date(),
                }),
                variantId: z.string(),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { productId, productVariantId, inventoryItemId } = request.params

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
        await tenant.queries.products.variants.getProductVariant({
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

      const inventoryItem =
        await tenant.queries.products.variants.inventoryItems.getInventoryWithRelations(
          { tenant: tenant.name, productVariantId, inventoryItemId },
        )

      if (!inventoryItem) {
        throw new BadRequestError({
          code: 'INVENTORY_ITEM_NOT_FOUND',
          message: 'Inventory item not found.',
        })
      }

      return {
        inventoryItem: {
          ...inventoryItem,
          variant: {
            ...inventoryItem.variant,
            options: inventoryItem.variant.options.map(({ optionValue }) => ({
              ...optionValue,
              option: optionValue.option,
            })),
          },
        },
      }
    },
  )
}
