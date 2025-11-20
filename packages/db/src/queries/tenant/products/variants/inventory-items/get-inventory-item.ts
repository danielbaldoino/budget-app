import { and, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../../../../../db'
import {
  buildRelationFirstQuery,
  buildRelationManyQuery,
} from '../../../../../lib/utils'
import { tenantSchema } from '../../../../../tenant'

type GetInventoryItemParams = {
  tenant: string
  productVariantId: string
  inventoryItemId?: string
}

export async function getInventoryItem(params: GetInventoryItemParams) {
  return tenantSchema(params.tenant, async ({ inventoryItems }) => {
    const [inventoryItem] = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          params.inventoryItemId
            ? eq(inventoryItems.id, params.inventoryItemId)
            : undefined,
          eq(inventoryItems.variantId, params.productVariantId),
        ),
      )
      .limit(1)

    return inventoryItem || null
  })
}

type GetInventoryWithRelationsParams = {
  tenant: string
  productVariantId: string
  inventoryItemId: string
}

export async function getInventoryWithRelations(
  params: GetInventoryWithRelationsParams,
) {
  return tenantSchema(
    params.tenant,
    async ({
      inventoryItems,
      productVariants,
      productImages,
      productOptionValuesToProductVariants,
      productOptionValues,
      productOptions,
    }) => {
      const productVariantsSubQuery = buildRelationFirstQuery({
        as: 'variant',
        table: productVariants,
        where: eq(productVariants.id, inventoryItems.variantId),
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

      const [inventoryItem] = await db
        .select({
          ...getTableColumns(inventoryItems),
          variant: productVariantsSubQuery.data,
        })
        .from(inventoryItems)
        .leftJoinLateral(productVariantsSubQuery, sql`true`)
        .where(
          and(
            eq(inventoryItems.id, params.inventoryItemId),
            eq(inventoryItems.variantId, params.productVariantId),
          ),
        )
        .limit(1)

      return inventoryItem || null
    },
  )
}
