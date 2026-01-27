import { and, eq, ne } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../../../../tenant'

type GetInventoryLevelParams = {
  tenant: string
  inventoryItemId: string
  inventoryLevelId?: string
  stockLocationId?: string
}

export async function getInventoryLevel(params: GetInventoryLevelParams) {
  return tenantSchema(params.tenant, async ({ inventoryLevels }) => {
    const inventoryLevel = await tenantDb(
      params.tenant,
    ).query.inventoryLevels.findFirst({
      where: and(
        params.inventoryLevelId
          ? eq(inventoryLevels.id, params.inventoryLevelId)
          : undefined,
        eq(inventoryLevels.inventoryItemId, params.inventoryItemId),
        params.stockLocationId
          ? eq(inventoryLevels.locationId, params.stockLocationId)
          : undefined,
      ),
    })

    return inventoryLevel || null
  })
}

type GetInventoryLevelByLocationParams = {
  tenant: string
  inventoryItemId: string
  stockLocationId: string
  not?: {
    inventoryLevelId: string
  }
}

export async function getInventoryLevelByLocation(
  params: GetInventoryLevelByLocationParams,
) {
  return tenantSchema(params.tenant, async ({ inventoryLevels }) => {
    const inventoryLevel = await tenantDb(
      params.tenant,
    ).query.inventoryLevels.findFirst({
      where: and(
        params.not
          ? ne(inventoryLevels.id, params.not.inventoryLevelId)
          : undefined,
        eq(inventoryLevels.inventoryItemId, params.inventoryItemId),
        eq(inventoryLevels.locationId, params.stockLocationId),
      ),
    })

    return inventoryLevel || null
  })
}

type GetInventoryLevelWithRelationsParams = {
  tenant: string
  inventoryLevelId: string
  inventoryItemId: string
}

export async function getInventoryLevelWithRelations(
  params: GetInventoryLevelWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ inventoryLevels }) => {
    const inventoryLevel = await tenantDb(
      params.tenant,
    ).query.inventoryLevels.findFirst({
      where: and(
        eq(inventoryLevels.id, params.inventoryLevelId),
        eq(inventoryLevels.inventoryItemId, params.inventoryItemId),
      ),
      with: {
        location: {
          with: {
            address: true,
          },
        },
      },
    })

    return inventoryLevel || null
  })
}
