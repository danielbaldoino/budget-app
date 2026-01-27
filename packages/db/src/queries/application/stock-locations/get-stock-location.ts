import { and, eq, ne } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetStockLocationParams = {
  tenant: string
  stockLocationId: string
}

export async function getStockLocation(params: GetStockLocationParams) {
  return tenantSchema(params.tenant, async ({ stockLocations }) => {
    const stockLocation = await tenantDb(
      params.tenant,
    ).query.stockLocations.findFirst({
      where: eq(stockLocations.id, params.stockLocationId),
    })

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
    const stockLocation = await tenantDb(
      params.tenant,
    ).query.stockLocations.findFirst({
      where: and(
        params.not
          ? ne(stockLocations.id, params.not.stockLocationId)
          : undefined,
        eq(stockLocations.name, params.name),
      ),
    })

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
  return tenantSchema(params.tenant, async ({ stockLocations }) => {
    const stockLocation = await tenantDb(
      params.tenant,
    ).query.stockLocations.findFirst({
      where: eq(stockLocations.id, params.stockLocationId),
      with: {
        address: true,
      },
    })

    return stockLocation || null
  })
}
