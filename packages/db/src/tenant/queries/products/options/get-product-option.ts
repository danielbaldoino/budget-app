import { and, eq, ne } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../../tenant'

type GetProductOptionParams = {
  tenant: string
  productId: string
  productOptionId: string
}

export async function getProductOption(params: GetProductOptionParams) {
  return tenantSchema(params.tenant, async ({ productOptions }) => {
    const productOption = await tenantDb(
      params.tenant,
    ).query.productOptions.findFirst({
      where: and(
        eq(productOptions.id, params.productOptionId),
        eq(productOptions.productId, params.productId),
      ),
    })

    return productOption || null
  })
}

type GetProductOptionByNameParams = {
  tenant: string
  productId: string
  name: string
  not?: {
    productOptionId: string
  }
}

export async function getProductOptionByName(
  params: GetProductOptionByNameParams,
) {
  return tenantSchema(params.tenant, async ({ productOptions }) => {
    const productOption = await tenantDb(
      params.tenant,
    ).query.productOptions.findFirst({
      where: and(
        params.not
          ? ne(productOptions.id, params.not.productOptionId)
          : undefined,
        eq(productOptions.productId, params.productId),
        eq(productOptions.name, params.name),
      ),
    })

    return productOption || null
  })
}

type GetProductOptionWithRelationsParams = {
  tenant: string
  productId: string
  productOptionId: string
}

export async function getProductOptionWithRelations(
  params: GetProductOptionWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ productOptions }) => {
    const productOption = await tenantDb(
      params.tenant,
    ).query.productOptions.findFirst({
      where: and(
        eq(productOptions.id, params.productOptionId),
        eq(productOptions.productId, params.productId),
      ),
      with: {
        values: true,
      },
    })

    return productOption || null
  })
}
