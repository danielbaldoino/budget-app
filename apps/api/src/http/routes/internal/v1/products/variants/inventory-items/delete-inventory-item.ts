import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { queries } from '@workspace/db/queries'
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
      const { productId, productVariantId, inventoryItemId } = request.params

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

      await tenantDb.transaction(async (tx) =>
        tenantSchema(async ({ inventoryItems, productVariants }) => {
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
