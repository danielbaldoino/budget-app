import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteInventoryLevel(app: FastifyTypedInstance) {
  app.delete(
    '/products/:productId/variants/:productVariantId/inventory-items/:inventoryItemId/inventory-levels/:inventoryLevelId',
    {
      schema: {
        tags: ['Inventory Levels'],
        summary: 'Delete an inventory level',
        operationId: 'deleteInventoryLevel',
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

      await tenant.schema(({ inventoryLevels }) =>
        tenant.db
          .delete(inventoryLevels)
          .where(orm.eq(inventoryLevels.id, inventoryLevelId)),
      )

      return reply.status(204).send()
    },
  )
}
