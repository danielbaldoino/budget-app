import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantSchema } from '../../../tenant'

type GetProductCategoryParams = {
  tenant: string
  productCategoryId: string
}

export async function getProductCategory(params: GetProductCategoryParams) {
  return tenantSchema(params.tenant, async ({ productCategories }) => {
    const [productCategory] = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, params.productCategoryId))
      .limit(1)

    return productCategory || null
  })
}
