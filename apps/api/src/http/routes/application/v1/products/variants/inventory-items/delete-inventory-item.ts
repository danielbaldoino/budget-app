import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteInventoryItem(app: FastifyTypedInstance) {
  app.delete(
    '/products/:productId/variants/:productVariantId/inventory-items/:inventoryItemId',
    {
      schema: {
        tags: ['Inventory Items'],
        summary: 'Delete an inventory item',
        operationId: 'deleteInventoryItem',
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
          inventoryItemId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
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

      await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ inventoryItems, productVariants }) => {
          await tx
            .delete(inventoryItems)
            .where(orm.eq(inventoryItems.id, inventoryItemId))

          await tx
            .update(productVariants)
            .set({ manageInventory: false })
            .where(orm.eq(productVariants.id, productVariantId))
        }),
      )

      return reply.status(204).send()
    },
  )
}
