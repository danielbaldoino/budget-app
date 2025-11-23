import { and, eq, ne } from 'drizzle-orm'
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

type GetProductCategoryByNameParams = {
  tenant: string
  name: string
  not?: {
    productCategoryId: string
  }
}

export async function getProductCategoryByName(
  params: GetProductCategoryByNameParams,
) {
  return tenantSchema(params.tenant, async ({ productCategories }) => {
    const [productCategory] = await db
      .select()
      .from(productCategories)
      .where(
        and(
          params.not
            ? ne(productCategories.id, params.not.productCategoryId)
            : undefined,
          eq(productCategories.name, params.name),
        ),
      )
      .limit(1)

    return productCategory || null
  })
}
