import { and, eq, isNull } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetPriceSetParams = {
  tenant: string
  priceSetId: string
}

export async function getPriceSet(params: GetPriceSetParams) {
  return tenantSchema(params.tenant, async ({ priceSets }) => {
    const priceSet = await tenantDb(params.tenant).query.priceSets.findFirst({
      where: eq(priceSets.id, params.priceSetId),
    })

    return priceSet || null
  })
}

type GetPriceSetByProductVariantIdParams = {
  tenant: string
  productVariantId: string
  priceListId?: string | null
}

export async function getPriceSetByProductVariantId(
  params: GetPriceSetByProductVariantIdParams,
) {
  return tenantSchema(params.tenant, async ({ priceSets }) => {
    const priceSet = await tenantDb(params.tenant).query.priceSets.findFirst({
      where: and(
        eq(priceSets.productVariantId, params.productVariantId),
        params.priceListId
          ? eq(priceSets.priceListId, params.priceListId)
          : isNull(priceSets.priceListId),
      ),
    })

    return priceSet || null
  })
}
