import {
  type SQL,
  asc,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  sql,
} from 'drizzle-orm'
import { db } from '../../../db'
import {
  buildRelationFirstQuery,
  buildRelationManyQuery,
} from '../../../lib/utils'
import { tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'name', 'subtitle', 'description'] as const
const SORT_BY = ['name', 'subtitle', 'description', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListProductsWithRelationsParams = {
  tenant: string
}

type ListProductsWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListProductsWithRelations(
  params: ListProductsWithRelationsParams,
  filters: ListProductsWithRelationsFiltersParams,
) {
  return tenantSchema(
    params.tenant,
    async ({
      products,
      productImages,
      productCategories,
      productOptions,
      productOptionValues,
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

      const WHERE = () => {
        const searchCondition: SQL[] = []

        if (filters.search) {
          if (filters.filterBy === 'all' || filters.filterBy === 'name') {
            searchCondition.push(ilike(products.name, `%${filters.search}%`))
          }

          if (filters.filterBy === 'all' || filters.filterBy === 'subtitle') {
            searchCondition.push(
              ilike(products.subtitle, `%${filters.search}%`),
            )
          }

          if (
            filters.filterBy === 'all' ||
            filters.filterBy === 'description'
          ) {
            searchCondition.push(
              ilike(products.description, `%${filters.search}%`),
            )
          }
        }

        return or(...searchCondition)
      }

      const ORDER_BY = () => {
        const orderFn = filters.order === 'asc' ? asc : desc

        if (filters.sortBy === 'name') {
          return orderFn(products.name)
        }

        if (filters.sortBy === 'subtitle') {
          return orderFn(products.subtitle)
        }

        if (filters.sortBy === 'description') {
          return orderFn(products.description)
        }

        return orderFn(products.createdAt)
      }

      const [count, listProducts] = await Promise.all([
        db.$count(products, WHERE()),

        db
          .select({
            ...getTableColumns(products),
            images: productImagesSubQuery.data,
            category: productCategoriesSubQuery.data,
            options: productOptionsSubQuery.data,
          })
          .from(products)
          .leftJoinLateral(productImagesSubQuery, sql`true`)
          .leftJoinLateral(productCategoriesSubQuery, sql`true`)
          .leftJoinLateral(productOptionsSubQuery, sql`true`)
          .where(WHERE())
          .orderBy(ORDER_BY())
          .offset((filters.page - 1) * filters.pageSize)
          .limit(filters.pageSize),
      ])

      return {
        count,
        products: listProducts,
      }
    },
  )
}

export const listProductsWithRelations = Object.assign(
  getListProductsWithRelations,
  { FILTER_BY, SORT_BY, ORDER },
)

type ListProductsByIdsParams = {
  tenant: string
  productIds: string[]
}

export async function listProductsByIds(params: ListProductsByIdsParams) {
  return tenantSchema(params.tenant, async ({ products }) => {
    const listProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, params.productIds))

    return listProducts
  })
}
