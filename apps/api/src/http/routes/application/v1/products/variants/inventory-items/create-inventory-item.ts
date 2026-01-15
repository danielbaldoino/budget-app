import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function createInventoryItem(app: FastifyTypedInstance) {
  app.post(
    '/products/:productId/variants/:productVariantId/inventory-items',
    {
      schema: {
        tags: ['Inventory Items'],
        summary: 'Create a new inventory item',
        operationId: 'createInventoryItem',
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              inventoryItemId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
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

      if (!productVariant.manageInventory) {
        throw new BadRequestError({
          code: 'INVENTORY_MANAGEMENT_NOT_ENABLED',
          message: 'Inventory management is not enabled for this variant.',
        })
      }

      const inventoryItemExists =
        await tenant.queries.products.variants.inventoryItems.getInventoryItem({
          tenant: tenant.name,
          productVariantId,
        })

      if (inventoryItemExists) {
        throw new BadRequestError({
          code: 'INVENTORY_ITEM_ALREADY_EXISTS',
          message: 'Inventory item already exists.',
        })
      }

      const [inventoryItem] = await tenant.schema(({ inventoryItems }) =>
        tenant.db
          .insert(inventoryItems)
          .values({
            variantId: productVariantId,
          })
          .returning(),
      )

      if (!inventoryItem) {
        throw new BadRequestError({
          code: 'INVENTORY_ITEM_NOT_CREATED',
          message: 'Inventory item not created.',
        })
      }

      return reply.status(201).send({
        inventoryItemId: inventoryItem.id,
      })
    },
  )
}
