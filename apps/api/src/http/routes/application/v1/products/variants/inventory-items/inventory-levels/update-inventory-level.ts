import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateInventoryLevel(app: FastifyTypedInstance) {
  app.patch(
    '/products/:productId/variants/:productVariantId/inventory-items/:inventoryItemId/inventory-levels/:inventoryLevelId',
    {
      schema: {
        tags: ['Inventory Levels'],
        summary: 'Update an inventory level',
        operationId: 'updateInventoryLevel',
        body: z.object({
          stockedQuantity: z.number().nonnegative(),
          locationId: z.string(),
        }),
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
          inventoryItemId: z.string(),
          inventoryLevelId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
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
        await tenant.queries.products.variants.inventoryItems.inventoryLevels.getInventoryLevel(
          { tenant: tenant.name, inventoryItemId, inventoryLevelId },
        )

      if (!inventoryLevel) {
        throw new BadRequestError({
          code: 'INVENTORY_LEVEL_NOT_FOUND',
          message: 'Inventory level not found.',
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
          {
            tenant: tenant.name,
            inventoryItemId,
            inventoryLevelId,
            stockLocationId: locationId,
          },
        )

      if (inventoryLevelByLocation) {
        throw new BadRequestError({
          code: 'INVENTORY_LEVEL_LOCATION_ALREADY_EXISTS',
          message: 'Inventory level already exists for this location.',
        })
      }

      await tenant.schema(({ inventoryLevels }) =>
        tenant.db
          .update(inventoryLevels)
          .set({
            stockedQuantity,
            locationId,
          })
          .where(orm.eq(inventoryLevels.id, inventoryLevelId)),
      )

      return reply.status(204).send()
    },
  )
}
