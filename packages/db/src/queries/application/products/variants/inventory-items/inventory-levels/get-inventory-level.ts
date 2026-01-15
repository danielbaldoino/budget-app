import { and, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../../../../../../db'
import {
  buildRelationFirstQuery,
  buildRelationManyQuery,
} from '../../../../../../lib/utils'
import { tenantSchema } from '../../../../../../tenant'

type GetInventoryLevelParams = {
  tenant: string
  inventoryItemId: string
  inventoryLevelId?: string
  stockLocationId?: string
}

export async function getInventoryLevel(params: GetInventoryLevelParams) {
  return tenantSchema(params.tenant, async ({ inventoryLevels }) => {
    const [inventoryLevel] = await db
      .select()
      .from(inventoryLevels)
      .where(
        and(
          params.inventoryLevelId
            ? eq(inventoryLevels.id, params.inventoryLevelId)
            : undefined,
          eq(inventoryLevels.inventoryItemId, params.inventoryItemId),
          params.stockLocationId
            ? eq(inventoryLevels.locationId, params.stockLocationId)
            : undefined,
        ),
      )
      .limit(1)

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
  return tenantSchema(
    params.tenant,
    async ({ inventoryLevels, stockLocations, addresses }) => {
      const stockLocationsSubQuery = buildRelationFirstQuery({
        as: 'location',
        table: stockLocations,
        where: eq(stockLocations.id, inventoryLevels.locationId),
        with: {
          addresses: buildRelationManyQuery({
            table: addresses,
            where: eq(addresses.stockLocationId, stockLocations.id),
          }),
        },
      })

      const [inventoryLevel] = await db
        .select({
          ...getTableColumns(inventoryLevels),
          location: stockLocationsSubQuery.data,
        })
        .from(inventoryLevels)
        .leftJoinLateral(stockLocationsSubQuery, sql`true`)
        .where(
          and(
            eq(inventoryLevels.id, params.inventoryLevelId),
            eq(inventoryLevels.inventoryItemId, params.inventoryItemId),
          ),
        )
        .limit(1)

      return inventoryLevel || null
    },
  )
}
