import { and, eq, getTableColumns, ne, sql } from 'drizzle-orm'
import { db } from '../../../db'
import { buildRelationManyQuery } from '../../../lib/utils'
import { tenantSchema } from '../../../tenant'

type GetStockLocationParams = {
  tenant: string
  stockLocationId: string
}

export async function getStockLocation(params: GetStockLocationParams) {
  return tenantSchema(params.tenant, async ({ stockLocations }) => {
    const [stockLocation] = await db
      .select()
      .from(stockLocations)
      .where(eq(stockLocations.id, params.stockLocationId))
      .limit(1)

    return stockLocation || null
  })
}

type GetStockLocationByNameParams = {
  tenant: string
  name: string
  not?: { stockLocationId: string }
}

export async function getStockLocationByName(
  params: GetStockLocationByNameParams,
) {
  return tenantSchema(params.tenant, async ({ stockLocations }) => {
    const [stockLocation] = await db
      .select()
      .from(stockLocations)
      .where(
        and(
          params.not
            ? ne(stockLocations.id, params.not.stockLocationId)
            : undefined,
          eq(stockLocations.name, params.name),
        ),
      )
      .limit(1)

    return stockLocation || null
  })
}

type GetStockLocationWithRelationsParams = {
  tenant: string
  stockLocationId: string
}

export async function getStockLocationWithRelations(
  params: GetStockLocationWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ stockLocations, addresses }) => {
    const addressesSubQuery = buildRelationManyQuery({
      as: 'addresses',
      table: addresses,
      where: eq(addresses.stockLocationId, stockLocations.id),
    })

    const [stockLocation] = await db
      .select({
        ...getTableColumns(stockLocations),
        addresses: addressesSubQuery.data,
      })
      .from(stockLocations)
      .leftJoinLateral(addressesSubQuery, sql`true`)
      .where(eq(stockLocations.id, params.stockLocationId))
      .limit(1)

    return stockLocation || null
  })
}
