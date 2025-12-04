import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantSchema } from '../../../tenant'

type GetPriceSetParams = {
  tenant: string
  priceSetId: string
}

export async function getPriceSet(params: GetPriceSetParams) {
  return tenantSchema(params.tenant, async ({ priceSets }) => {
    const [priceSet] = await db
      .select()
      .from(priceSets)
      .where(eq(priceSets.id, params.priceSetId))
      .limit(1)

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
    const [priceSet] = await db
      .select()
      .from(priceSets)
      .where(
        and(
          eq(priceSets.productVariantId, params.productVariantId),
          params.priceListId
            ? eq(priceSets.priceListId, params.priceListId)
            : isNull(priceSets.priceListId),
        ),
      )
      .limit(1)

    return priceSet || null
  })
}
