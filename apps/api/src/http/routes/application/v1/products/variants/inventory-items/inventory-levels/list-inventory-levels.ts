import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } =
  queries.application.products.variants.inventoryItems.inventoryLevels
    .listInventoryLevelsWithRelations

export async function listInventoryLevels(app: FastifyTypedInstance) {
  app.get(
    '/products/:productId/variants/:productVariantId/inventory-items/:inventoryItemId/inventory-levels',
    {
      schema: {
        tags: ['Inventory Levels'],
        summary: 'Get inventory levels of an inventory item',
        operationId: 'listInventoryLevels',
        params: z.object({
          productId: z.string(),
          productVariantId: z.string(),
          inventoryItemId: z.string(),
        }),
        querystring: z.object({
          search: z.string().optional(),
          filterBy: z.enum(FILTER_BY).optional().default('all'),
          sortBy: z.enum(SORT_BY).optional().default('createdAt'),
          order: z.enum(ORDER).optional().default('desc'),
          page: z.coerce.number().positive().optional().default(1),
          pageSize: z.coerce.number().min(10).max(100).optional().default(50),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              meta: z.object({
                search: z.string().optional(),
                filterBy: z.enum(FILTER_BY),
                sortBy: z.enum(SORT_BY),
                order: z.enum(ORDER),
                count: z.number(),
                page: z.number(),
                pageSize: z.number(),
              }),
              inventoryLevels: z.array(
                z.object({
                  id: z.string(),
                  stockedQuantity: z.number().nonnegative(),
                  location: z.object({
                    id: z.string(),
                    name: z.string(),
                    createdAt: z.coerce.date(),
                    updatedAt: z.coerce.date(),
                  }),
                  inventoryItemId: z.string(),
                  createdAt: z.coerce.date(),
                  updatedAt: z.coerce.date(),
                }),
              ),
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

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, inventoryLevels } =
        await tenant.queries.products.variants.inventoryItems.inventoryLevels.listInventoryLevelsWithRelations(
          { tenant: tenant.name, inventoryItemId },
          { search, filterBy, sortBy, order, page, pageSize },
        )

      return {
        meta: {
          search,
          filterBy,
          sortBy,
          order,
          count,
          page,
          pageSize,
        },
        inventoryLevels: inventoryLevels.map((inventoryLevel) => ({
          ...inventoryLevel!,
          location: inventoryLevel.location!,
        })),
      }
    },
  )
}
