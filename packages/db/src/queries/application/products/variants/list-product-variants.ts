import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sql,
} from 'drizzle-orm'
import { db } from '../../../../db'
import {
  buildRelationFirstQuery,
  buildRelationManyQuery,
} from '../../../../lib/utils'
import { tenantSchema } from '../../../../tenant'

const FILTER_BY = ['all', 'name', 'sku'] as const
const SORT_BY = ['name', 'sku', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListProductVariantsWithRelationsParams = {
  tenant: string
  productId: string
  priceListId?: string
}

type ListProductVariantsWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListProductVariantsWithRelations(
  params: ListProductVariantsWithRelationsParams,
  filters: ListProductVariantsWithRelationsFiltersParams,
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

      const WHERE = () => {
        const searchCondition: SQL[] = []

        if (filters.search) {
          if (filters.filterBy === 'all' || filters.filterBy === 'name') {
            searchCondition.push(
              ilike(productVariants.name, `%${filters.search}%`),
            )
          }

          if (filters.filterBy === 'all' || filters.filterBy === 'sku') {
            searchCondition.push(
              ilike(productVariants.sku, `%${filters.search}%`),
            )
          }
        }

        return and(
          eq(productVariants.productId, params.productId),
          or(...searchCondition),
        )
      }

      const ORDER_BY = () => {
        const orderFn = filters.order === 'asc' ? asc : desc

        if (filters.sortBy === 'name') {
          return orderFn(productVariants.name)
        }

        if (filters.sortBy === 'sku') {
          return orderFn(productVariants.sku)
        }

        return orderFn(productVariants.createdAt)
      }

      const [count, listProductVariants] = await Promise.all([
        db.$count(productVariants, WHERE()),

        db
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
          .where(WHERE())
          .orderBy(ORDER_BY())
          .offset((filters.page - 1) * filters.pageSize)
          .limit(filters.pageSize),
      ])

      return {
        count,
        productVariants: listProductVariants,
      }
    },
  )
}

export const listProductVariantsWithRelations = Object.assign(
  getListProductVariantsWithRelations,
  { FILTER_BY, SORT_BY, ORDER },
)

type ListProductVariantsWithOptionsParams = {
  tenant: string
  productId: string
  productVariantId?: string
}

export async function listProductVariantsWithOptions(
  params: ListProductVariantsWithOptionsParams,
) {
  return tenantSchema(
    params.tenant,
    async ({
      productVariants,
      productOptionValuesToProductVariants,
      productOptionValues,
      productOptions,
    }) => {
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

      const listProductVariants = await db
        .select({
          ...getTableColumns(productVariants),
          options: productOptionValuesToProductVariantsSubQuery.data,
        })
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, params.productId),
            params.productVariantId
              ? eq(productVariants.id, params.productVariantId)
              : undefined,
          ),
        )

      return listProductVariants
    },
  )
}
