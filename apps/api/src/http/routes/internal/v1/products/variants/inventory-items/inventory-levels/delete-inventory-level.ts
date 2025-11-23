import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { queries } from '@workspace/db/queries'
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
      const { productId, productVariantId, inventoryItemId, inventoryLevelId } =
        request.params

      const { tenant, tenantSchema, tenantDb } = request.internal

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
        await queries.tenant.products.variants.getProductVariant({
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

      const inventoryItem =
        await queries.tenant.products.variants.inventoryItems.getInventoryItem({
          tenant,
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
        await queries.tenant.products.variants.inventoryItems.inventoryLevels.getInventoryLevel(
          { tenant, inventoryItemId, inventoryLevelId },
        )

      if (!inventoryLevel) {
        throw new BadRequestError({
          code: 'INVENTORY_LEVEL_NOT_FOUND',
          message: 'Inventory level not found.',
        })
      }

      await tenantSchema(({ inventoryLevels }) =>
        tenantDb
          .delete(inventoryLevels)
          .where(orm.eq(inventoryLevels.id, inventoryLevelId)),
      )

      return reply.status(204).send()
    },
  )
}
