import { and, eq, ne } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../../tenant'

type GetProductVariantParams = {
  tenant: string
  productId: string
  productVariantId: string
}

export async function getProductVariant(params: GetProductVariantParams) {
  return tenantSchema(params.tenant, async ({ productVariants }) => {
    const productVariant = await tenantDb(
      params.tenant,
    ).query.productVariants.findFirst({
      where: and(
        eq(productVariants.id, params.productVariantId),
        eq(productVariants.productId, params.productId),
      ),
    })

    return productVariant || null
  })
}

type GetProductVariantByNameParams = {
  tenant: string
  productId: string
  name: string
  not?: {
    productVariantId: string
  }
}

export async function getProductVariantByName(
  params: GetProductVariantByNameParams,
) {
  return tenantSchema(params.tenant, async ({ productVariants }) => {
    const productVariant = await tenantDb(
      params.tenant,
    ).query.productVariants.findFirst({
      where: and(
        params.not
          ? ne(productVariants.id, params.not.productVariantId)
          : undefined,
        eq(productVariants.productId, params.productId),
        eq(productVariants.name, params.name),
      ),
    })

    return productVariant || null
  })
}

type GetProductVariantBySkuParams = {
  tenant: string
  productId: string
  sku: string
  not?: {
    productVariantId: string
  }
}

export async function getProductVariantBySku(
  params: GetProductVariantBySkuParams,
) {
  return tenantSchema(params.tenant, async ({ productVariants }) => {
    const productVariant = await tenantDb(
      params.tenant,
    ).query.productVariants.findFirst({
      where: and(
        params.not
          ? ne(productVariants.id, params.not.productVariantId)
          : undefined,
        eq(productVariants.productId, params.productId),
        eq(productVariants.sku, params.sku),
      ),
    })

    return productVariant || null
  })
}

type GetProductVariantWithRelationsParams = {
  tenant: string
  productId: string
  productVariantId: string
  priceListId?: string
}

export async function getProductVariantWithRelations(
  params: GetProductVariantWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ productVariants, priceSets }) => {
    const productVariant = await tenantDb(
      params.tenant,
    ).query.productVariants.findFirst({
      where: and(
        eq(productVariants.id, params.productVariantId),
        eq(productVariants.productId, params.productId),
      ),
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
        priceSets: {
          where: params.priceListId
            ? eq(priceSets.priceListId, params.priceListId)
            : undefined,
          with: {
            prices: true,
          },
        },
        inventoryItem: {
          with: {
            inventoryLevels: {
              with: {
                location: {
                  with: {
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return productVariant || null
  })
}
