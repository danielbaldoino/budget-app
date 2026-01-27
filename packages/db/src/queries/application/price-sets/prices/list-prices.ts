import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../../tenant'

type ListPricesParams = {
  tenant: string
  priceSetId: string
}

export async function listPrices(params: ListPricesParams) {
  return tenantSchema(params.tenant, async ({ prices }) => {
    const listPrices = await tenantDb(params.tenant).query.prices.findMany({
      where: eq(prices.priceSetId, params.priceSetId),
    })

    return listPrices
  })
}
