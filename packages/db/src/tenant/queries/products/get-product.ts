import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetProductParams = {
  tenant: string
  productId: string
}

export async function getProduct(params: GetProductParams) {
  return tenantSchema(params.tenant, async ({ products }) => {
    const product = await tenantDb(params.tenant).query.products.findFirst({
      where: eq(products.id, params.productId),
    })

    return product || null
  })
}

type GetProductWithRelationsParams = {
  tenant: string
  productId: string
}

export async function getProductWithRelations(
  params: GetProductWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ products }) => {
    const product = await tenantDb(params.tenant).query.products.findFirst({
      where: eq(products.id, params.productId),
      with: {
        images: true,
        category: true,
        options: {
          with: {
            values: true,
          },
        },
        variants: {
          with: {
            images: true,
            options: {
              with: {
                optionValue: {
                  with: {
                    option: true,
                  },
                },
              },
            },
          },
        },
        detail: true,
      },
    })

    return product || null
  })
}
