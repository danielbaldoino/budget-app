import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getInventoryLevel(app: FastifyTypedInstance) {
  app.get(
    '/products/:productId/variants/:productVariantId/inventory-items/:inventoryItemId/inventory-levels/:inventoryLevelId',
    {
      schema: {
        tags: ['Inventory Levels'],
        summary: 'Get inventory level details',
        operationId: 'getInventoryLevel',
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
          inventoryItemId: z.string(),
          inventoryLevelId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              inventoryLevel: z.object({
                id: z.string(),
                stockedQuantity: z.number().nonnegative(),
                location: z.object({
                  id: z.string(),
                  name: z.string(),
                  addresses: z.array(
                    z.object({
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
                      createdAt: z.coerce.date(),
                      updatedAt: z.coerce.date(),
                    }),
                  ),
                  createdAt: z.coerce.date(),
                  updatedAt: z.coerce.date(),
                }),
                inventoryItemId: z.string(),
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

      const { productId, productVariantId, inventoryItemId, inventoryLevelId } =
        request.params

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
        await tenant.queries.products.variants.inventoryItems.getInventoryItem({
          tenant: tenant.name,
          productVariantId,
          inventoryItemId,
        })

      if (!inventoryItem) {
        throw new BadRequestError({
          code: 'INVENTORY_ITEM_NOT_FOUND',
          message: 'Inventory item not found.',
        })
      }

      const inventoryLevel =
        await tenant.queries.products.variants.inventoryItems.inventoryLevels.getInventoryLevelWithRelations(
          { tenant: tenant.name, inventoryItemId, inventoryLevelId },
        )

      if (!inventoryLevel) {
        throw new BadRequestError({
          code: 'INVENTORY_LEVEL_NOT_FOUND',
          message: 'Inventory level not found.',
        })
      }

      return {
        inventoryLevel: {
          ...inventoryLevel,
          location: inventoryLevel.location!,
        },
      }
    },
  )
}
