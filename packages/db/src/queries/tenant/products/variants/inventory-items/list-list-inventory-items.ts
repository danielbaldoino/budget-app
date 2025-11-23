import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  exists,
  getTableColumns,
  ilike,
  or,
  sql,
} from 'drizzle-orm'
import { db } from '../../../../../db'
import {
  buildRelationFirstQuery,
  buildRelationManyQuery,
} from '../../../../../lib/utils'
import { tenantSchema } from '../../../../../tenant'

const FILTER_BY = [
  'all',
  'variant.name',
  'variant.sku',
  'variant.product.name',
  'variant.product.subtitle',
  'variant.product.description',
] as const
const SORT_BY = ['createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListInventoryItemsWithRelationsParams = {
  tenant: string
}

type ListInventoryItemsWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListInventoryItemsWithRelations(
  params: ListInventoryItemsWithRelationsParams,
  filters: ListInventoryItemsWithRelationsFiltersParams,
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
      products,
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
          product: buildRelationFirstQuery({
            table: products,
            where: eq(products.id, productVariants.productId),
            with: {
              images: buildRelationManyQuery({
                table: productImages,
                where: eq(productImages.productId, products.id),
              }),
              options: buildRelationManyQuery({
                table: productOptions,
                where: eq(productOptions.productId, products.id),
                with: {
                  values: buildRelationManyQuery({
                    table: productOptionValues,
                    where: eq(productOptionValues.optionId, productOptions.id),
                  }),
                },
              }),
            },
          }),
        },
      })

      const WHERE = () => {
        const searchCondition: SQL[] = []

        if (filters.search) {
          if (
            filters.filterBy === 'all' ||
            filters.filterBy.startsWith('variant.')
          ) {
            const variantSearchCondition: SQL[] = []

            if (
              filters.filterBy === 'all' ||
              filters.filterBy === 'variant.name'
            ) {
              variantSearchCondition.push(
                ilike(productVariants.name, `%${filters.search}%`),
              )
            }

            if (
              filters.filterBy === 'all' ||
              filters.filterBy === 'variant.sku'
            ) {
              variantSearchCondition.push(
                ilike(productVariants.sku, `%${filters.search}%`),
              )
            }

            if (
              filters.filterBy === 'all' ||
              filters.filterBy === 'variant.product.name'
            ) {
              variantSearchCondition.push(
                ilike(products.name, `%${filters.search}%`),
              )
            }

            if (
              filters.filterBy === 'all' ||
              filters.filterBy === 'variant.product.subtitle'
            ) {
              variantSearchCondition.push(
                ilike(products.subtitle, `%${filters.search}%`),
              )
            }

            if (
              filters.filterBy === 'all' ||
              filters.filterBy === 'variant.product.description'
            ) {
              variantSearchCondition.push(
                ilike(products.description, `%${filters.search}%`),
              )
            }

            searchCondition.push(
              exists(
                db
                  .select({ exists: sql`1` })
                  .from(productVariants)
                  .leftJoin(
                    products,
                    eq(productVariants.productId, products.id),
                  )
                  .where(
                    and(
                      eq(productVariants.id, inventoryItems.variantId),
                      or(...variantSearchCondition),
                    ),
                  ),
              ),
            )
          }
        }

        return or(...searchCondition)
      }

      const ORDER_BY = () => {
        const orderFn = filters.order === 'asc' ? asc : desc

        return orderFn(inventoryItems.createdAt)
      }

      const [count, listInventoryItems] = await Promise.all([
        db.$count(inventoryItems, WHERE()),

        db
          .select({
            ...getTableColumns(inventoryItems),
            variant: productVariantsSubQuery.data,
          })
          .from(inventoryItems)
          .leftJoinLateral(productVariantsSubQuery, sql`true`)
          .where(WHERE())
          .orderBy(ORDER_BY())
          .offset((filters.page - 1) * filters.pageSize)
          .limit(filters.pageSize),
      ])

      return {
        count,
        inventoryItems: listInventoryItems,
      }
    },
  )
}

export const listInventoryItemsWithRelations = Object.assign(
  getListInventoryItemsWithRelations,
  { FILTER_BY, SORT_BY, ORDER },
)
