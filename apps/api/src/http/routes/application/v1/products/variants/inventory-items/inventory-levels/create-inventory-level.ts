import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function createInventoryLevel(app: FastifyTypedInstance) {
  app.post(
    '/products/:productId/variants/:productVariantId/inventory-items/:inventoryItemId/inventory-levels',
    {
      schema: {
        tags: ['Inventory Levels'],
        summary: 'Create a new inventory level',
        operationId: 'createInventoryLevel',
        body: z.object({
          stockedQuantity: z.number().nonnegative(),
          locationId: z.string(),
        }),
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
          inventoryItemId: z.string(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              inventoryLevelId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
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

      const { stockedQuantity, locationId } = request.body

      const stockLocation =
        await tenant.queries.stockLocations.getStockLocation({
          tenant: tenant.name,
          stockLocationId: locationId,
        })

      if (!stockLocation) {
        throw new BadRequestError({
          code: 'STOCK_LOCATION_NOT_FOUND',
          message: 'Stock location not found.',
        })
      }

      const inventoryLevelByLocation =
        await tenant.queries.products.variants.inventoryItems.inventoryLevels.getInventoryLevel(
          { tenant: tenant.name, inventoryItemId, stockLocationId: locationId },
        )

      if (inventoryLevelByLocation) {
        throw new BadRequestError({
          code: 'INVENTORY_LEVEL_LOCATION_ALREADY_EXISTS',
          message: 'Inventory level already exists for this location.',
        })
      }

      const [inventoryLevel] = await tenant.schema(({ inventoryLevels }) =>
        tenant.db
          .insert(inventoryLevels)
          .values({
            inventoryItemId,
            stockedQuantity,
            locationId,
          })
          .returning(),
      )

      if (!inventoryLevel) {
        throw new BadRequestError({
          code: 'INVENTORY_LEVEL_NOT_CREATED',
          message: 'Inventory level not created.',
        })
      }

      return reply.status(201).send({
        inventoryLevelId: inventoryLevel.id,
      })
    },
  )
}
