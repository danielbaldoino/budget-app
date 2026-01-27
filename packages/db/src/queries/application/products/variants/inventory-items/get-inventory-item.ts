import { and, eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../../../tenant'

type GetInventoryItemParams = {
  tenant: string
  productVariantId: string
  inventoryItemId?: string
}

export async function getInventoryItem(params: GetInventoryItemParams) {
  return tenantSchema(params.tenant, async ({ inventoryItems }) => {
    const inventoryItem = await tenantDb(
      params.tenant,
    ).query.inventoryItems.findFirst({
      where: and(
        params.inventoryItemId
          ? eq(inventoryItems.id, params.inventoryItemId)
          : undefined,
        eq(inventoryItems.variantId, params.productVariantId),
      ),
    })

    return inventoryItem || null
  })
}

type GetInventoryWithRelationsParams = {
  tenant: string
  productVariantId: string
  inventoryItemId: string
}

export async function getInventoryWithRelations(
  params: GetInventoryWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ inventoryItems }) => {
    const inventoryItem = await tenantDb(
      params.tenant,
    ).query.inventoryItems.findFirst({
      where: and(
        eq(inventoryItems.id, params.inventoryItemId),
        eq(inventoryItems.variantId, params.productVariantId),
      ),
      with: {
        variant: {
          with: {
            images: true,
            options: {
              with: {
                optionValue: {
                  with: {
                    option: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return inventoryItem || null
  })
}
