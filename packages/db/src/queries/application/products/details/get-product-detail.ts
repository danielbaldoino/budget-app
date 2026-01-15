import { eq } from 'drizzle-orm'
import { db } from '../../../../db'
import { tenantSchema } from '../../../../tenant'

type GetProductDetailParams = {
  tenant: string
  productId: string
}

export async function getProductDetail(params: GetProductDetailParams) {
  return tenantSchema(params.tenant, async ({ productDetails }) => {
    const [productDetail] = await db
      .select()
      .from(productDetails)
      .where(eq(productDetails.productId, params.productId))
      .limit(1)

    return productDetail || null
  })
}
