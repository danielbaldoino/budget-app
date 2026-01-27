import { and, eq, ne } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetPriceListParams = {
  tenant: string
  priceListId: string
}

export async function getPriceList(params: GetPriceListParams) {
  return tenantSchema(params.tenant, async ({ priceLists }) => {
    const priceList = await tenantDb(params.tenant).query.priceLists.findFirst({
      where: eq(priceLists.id, params.priceListId),
    })

    return priceList || null
  })
}

type GetPriceListByNameParams = {
  tenant: string
  name: string
  not?: { priceListId: string }
}

export async function getPriceListByName(params: GetPriceListByNameParams) {
  return tenantSchema(params.tenant, async ({ priceLists }) => {
    const priceList = await tenantDb(params.tenant).query.priceLists.findFirst({
      where: and(
        params.not ? ne(priceLists.id, params.not.priceListId) : undefined,
        eq(priceLists.name, params.name),
      ),
    })

    return priceList || null
  })
}

type GetPriceListWithRelationsParams = {
  tenant: string
  priceListId: string
}

export async function getPriceListWithRelations(
  params: GetPriceListWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ priceLists }) => {
    const priceList = await tenantDb(params.tenant).query.priceLists.findFirst({
      where: eq(priceLists.id, params.priceListId),
      with: {
        priceSets: {
          with: {
            prices: true,
          },
        },
      },
    })

    return priceList || null
  })
}
