import { and, eq, getTableColumns, ne, sql } from 'drizzle-orm'
import { db } from '../../../../db'
import {
  buildRelationFirstQuery,
  buildRelationManyQuery,
} from '../../../../lib/utils'
import { tenantSchema } from '../../../../tenant'

type GetProductVariantParams = {
  tenant: string
  productId: string
  productVariantId: string
}

export async function getProductVariant(params: GetProductVariantParams) {
  return tenantSchema(params.tenant, async ({ productVariants }) => {
    const [productVariant] = await db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.id, params.productVariantId),
          eq(productVariants.productId, params.productId),
        ),
      )
      .limit(1)

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
    const [productVariant] = await db
      .select()
      .from(productVariants)
      .where(
        and(
          params.not
            ? ne(productVariants.id, params.not.productVariantId)
            : undefined,
          eq(productVariants.productId, params.productId),
          eq(productVariants.name, params.name),
        ),
      )
      .limit(1)

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
    const [productVariant] = await db
      .select()
      .from(productVariants)
      .where(
        and(
          params.not
            ? ne(productVariants.id, params.not.productVariantId)
            : undefined,
          eq(productVariants.productId, params.productId),
          eq(productVariants.sku, params.sku),
        ),
      )
      .limit(1)

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
  return tenantSchema(
    params.tenant,
    async ({
      productVariants,
      productImages,
      productOptionValuesToProductVariants,
      productOptionValues,
      productOptions,
      priceSets,
      prices,
    }) => {
      const productImagesSubQuery = buildRelationManyQuery({
        as: 'images',
        table: productImages,
        where: eq(productImages.variantId, productVariants.id),
      })

      const productOptionValuesToProductVariantsSubQuery =
        buildRelationManyQuery({
          as: 'options',
          table: productOptionValuesToProductVariants,
          where: eq(
            productOptionValuesToProductVariants.variantId,
            productVariants.id,
          ),
          with: {
            optionValue: buildRelationFirstQuery({
              table: productOptionValues,
              where: eq(
                productOptionValues.id,
                productOptionValuesToProductVariants.optionValueId,
              ),
              with: {
                option: buildRelationFirstQuery({
                  table: productOptions,
                  where: eq(productOptions.id, productOptionValues.optionId),
                }),
              },
            }),
          },
        })

      const priceSetsSubQuery = buildRelationManyQuery({
        as: 'priceSets',
        table: priceSets,
        where: and(
          eq(priceSets.productVariantId, productVariants.id),
          params.priceListId
            ? eq(priceSets.priceListId, params.priceListId)
            : undefined,
        ),
        with: {
          prices: buildRelationManyQuery({
            table: prices,
            where: eq(prices.priceSetId, priceSets.id),
          }),
        },
      })

      const [productVariant] = await db
        .select({
          ...getTableColumns(productVariants),
          images: productImagesSubQuery.data,
          options: productOptionValuesToProductVariantsSubQuery.data,
          priceSets: priceSetsSubQuery.data,
        })
        .from(productVariants)
        .leftJoinLateral(productImagesSubQuery, sql`true`)
        .leftJoinLateral(
          productOptionValuesToProductVariantsSubQuery,
          sql`true`,
        )
        .leftJoinLateral(priceSetsSubQuery, sql`true`)
        .where(
          and(
            eq(productVariants.id, params.productVariantId),
            eq(productVariants.productId, params.productId),
          ),
        )
        .limit(1)

      return productVariant || null
    },
  )
}
