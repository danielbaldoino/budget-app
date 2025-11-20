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
import { buildRelationManyQuery } from '../../../../lib/utils'
import { tenantSchema } from '../../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListProductOptionsParams = {
  tenant: string
  productId: string
}

type ListProductOptionsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListProductOptions(
  params: ListProductOptionsParams,
  filters: ListProductOptionsFiltersParams,
) {
  return tenantSchema(
    params.tenant,
    async ({ productOptions, productOptionValues }) => {
      const productOptionValuesSubQuery = buildRelationManyQuery({
        as: 'values',
        table: productOptionValues,
        where: eq(productOptionValues.optionId, productOptions.id),
      })

      const WHERE = () => {
        const searchCondition: SQL[] = []

        if (filters.search) {
          if (filters.filterBy === 'all' || filters.filterBy === 'name') {
            searchCondition.push(
              ilike(productOptions.name, `%${filters.search}%`),
            )
          }
        }

        return and(
          eq(productOptions.productId, params.productId),
          or(...searchCondition),
        )
      }

      const ORDER_BY = () => {
        const orderFn = filters.order === 'asc' ? asc : desc

        if (filters.sortBy === 'name') {
          return orderFn(productOptions.name)
        }

        return orderFn(productOptions.createdAt)
      }

      const [count, listProductOptions] = await Promise.all([
        db.$count(productOptions, WHERE()),

        db
          .select({
            ...getTableColumns(productOptions),
            values: productOptionValuesSubQuery.data,
          })
          .from(productOptions)
          .leftJoinLateral(productOptionValuesSubQuery, sql`true`)
          .where(WHERE())
          .orderBy(ORDER_BY())
          .offset((filters.page - 1) * filters.pageSize)
          .limit(filters.pageSize),
      ])

      return {
        count,
        productOptions: listProductOptions,
      }
    },
  )
}

export const listProductOptions = Object.assign(getListProductOptions, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})

type ListProductOptionsWithValuesParams = {
  tenant: string
  productId: string
}

export async function listProductOptionsWithValues(
  params: ListProductOptionsWithValuesParams,
) {
  return tenantSchema(
    params.tenant,
    async ({ productOptions, productOptionValues }) => {
      const productOptionsValuesSubQuery = buildRelationManyQuery({
        as: 'values',
        table: productOptionValues,
        where: eq(productOptionValues.optionId, productOptions.id),
      })

      const listProductOptions = await db
        .select({
          ...getTableColumns(productOptions),
          values: productOptionsValuesSubQuery.data,
        })
        .from(productOptions)
        .leftJoinLateral(productOptionsValuesSubQuery, sql`true`)
        .where(eq(productOptions.productId, params.productId))

      return listProductOptions
    },
  )
}
