import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../../tenant'

type GetProductDetailParams = {
  tenant: string
  productId: string
}

export async function getProductDetail(params: GetProductDetailParams) {
  return tenantSchema(params.tenant, async ({ productDetails }) => {
    const productDetail = tenantDb(
      params.tenant,
    ).query.productDetails.findFirst({
      where: eq(productDetails.productId, params.productId),
    })

    return productDetail || null
  })
}
