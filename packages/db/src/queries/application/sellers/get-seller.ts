import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetSellerParams = {
  tenant: string
  sellerId: string
}

export async function getSeller(params: GetSellerParams) {
  return tenantSchema(params.tenant, async ({ sellers }) => {
    const seller = await tenantDb(params.tenant).query.sellers.findFirst({
      where: eq(sellers.id, params.sellerId),
    })

    return seller || null
  })
}

type GetSellerWithRelationsParams = {
  tenant: string
  sellerId: string
}

export async function getSellerWithRelations(
  params: GetSellerWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ sellers }) => {
    const seller = await tenantDb(params.tenant).query.sellers.findFirst({
      where: eq(sellers.id, params.sellerId),
      with: {
        user: true,
      },
    })

    return seller || null
  })
}
