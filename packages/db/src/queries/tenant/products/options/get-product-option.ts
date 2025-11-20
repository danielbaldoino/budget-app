import { and, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../../../../db'
import { buildRelationManyQuery } from '../../../../lib/utils'
import { tenantSchema } from '../../../../tenant'

type GetProductOptionParams = {
  tenant: string
  productId: string
  productOptionId: string
}

export async function getProductOption(params: GetProductOptionParams) {
  return tenantSchema(params.tenant, async ({ productOptions }) => {
    const [productOption] = await db
      .select()
      .from(productOptions)
      .where(
        and(
          eq(productOptions.id, params.productOptionId),
          eq(productOptions.productId, params.productId),
        ),
      )
      .limit(1)

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
  return tenantSchema(
    params.tenant,
    async ({ productOptions, productOptionValues }) => {
      const productOptionsValuesSubQuery = buildRelationManyQuery({
        as: 'values',
        table: productOptionValues,
        where: eq(productOptionValues.optionId, productOptions.id),
      })

      const [productOption] = await db
        .select({
          ...getTableColumns(productOptions),
          values: productOptionsValuesSubQuery.data,
        })
        .from(productOptions)
        .leftJoinLateral(productOptionsValuesSubQuery, sql`true`)
        .where(
          and(
            eq(productOptions.id, params.productOptionId),
            eq(productOptions.productId, params.productId),
          ),
        )

      return productOption || null
    },
  )
}
