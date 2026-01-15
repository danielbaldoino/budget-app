import { eq } from 'drizzle-orm'
import { db } from '../../../../db'
import { tenantSchema } from '../../../../tenant'

type ListPricesParams = {
  tenant: string
  priceSetId: string
}

export async function listPrices(params: ListPricesParams) {
  return tenantSchema(params.tenant, async ({ prices }) => {
    const listPrices = await db
      .select()
      .from(prices)
      .where(eq(prices.priceSetId, params.priceSetId))

    return listPrices
  })
}
