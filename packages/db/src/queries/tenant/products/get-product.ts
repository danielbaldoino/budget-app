import { eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../../../db'
import {
  buildRelationFirstQuery,
  buildRelationManyQuery,
} from '../../../lib/utils'
import { tenantSchema } from '../../../tenant'

type GetProductParams = {
  tenant: string
  productId: string
}

export async function getProduct(params: GetProductParams) {
  return tenantSchema(params.tenant, async ({ products }) => {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, params.productId))
      .limit(1)

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
  return tenantSchema(
    params.tenant,
    async ({
      products,
      productImages,
      productCategories,
      productOptions,
      productOptionValues,
      productVariants,
      productOptionValuesToProductVariants,
      productDetails,
    }) => {
      const productImagesSubQuery = buildRelationManyQuery({
        as: 'images',
        table: productImages,
        where: eq(productImages.productId, products.id),
      })

      const productCategoriesSubQuery = buildRelationFirstQuery({
        as: 'category',
        table: productCategories,
        where: eq(productCategories.id, products.categoryId),
      })

      const productOptionsSubQuery = buildRelationManyQuery({
        as: 'options',
        table: productOptions,
        where: eq(productOptions.productId, products.id),
        with: {
          values: buildRelationManyQuery({
            table: productOptionValues,
            where: eq(productOptionValues.optionId, productOptions.id),
          }),
        },
      })

      const productVariantsSubQuery = buildRelationManyQuery({
        as: 'variants',
        table: productVariants,
        where: eq(productVariants.productId, products.id),
        with: {
          images: buildRelationManyQuery({
            table: productImages,
            where: eq(productImages.variantId, productVariants.id),
          }),
          options: buildRelationManyQuery({
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
          }),
        },
      })

      const productDetailSubQuery = buildRelationFirstQuery({
        as: 'detail',
        table: productDetails,
        where: eq(productDetails.productId, products.id),
      })

      const [product] = await db
        .select({
          ...getTableColumns(products),
          images: productImagesSubQuery.data,
          category: productCategoriesSubQuery.data,
          options: productOptionsSubQuery.data,
          variants: productVariantsSubQuery.data,
          detail: productDetailSubQuery.data,
        })
        .from(products)
        .leftJoinLateral(productImagesSubQuery, sql`true`)
        .leftJoinLateral(productCategoriesSubQuery, sql`true`)
        .leftJoinLateral(productOptionsSubQuery, sql`true`)
        .leftJoinLateral(productVariantsSubQuery, sql`true`)
        .leftJoinLateral(productDetailSubQuery, sql`true`)
        .where(eq(products.id, params.productId))
        .limit(1)

      return product || null
    },
  )
}
