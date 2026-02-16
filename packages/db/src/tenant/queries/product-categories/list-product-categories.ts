import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'referenceId', 'name'] as const
const SORT_BY = ['referenceId', 'name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListProductCategoriesParams = {
  tenant: string
}

type ListProductCategoriesFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}
async function getListProductCategories(
  params: ListProductCategoriesParams,
  filters: ListProductCategoriesFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ productCategories }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'referenceId') {
          searchCondition.push(
            ilike(productCategories.referenceId, `%${filters.search}%`),
          )
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(
            ilike(productCategories.name, `%${filters.search}%`),
          )
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'referenceId') {
        return orderFn(productCategories.referenceId)
      }

      if (filters.sortBy === 'name') {
        return orderFn(productCategories.name)
      }

      return orderFn(productCategories.createdAt)
    }

    const [count, listProductCategories] = await Promise.all([
      db.$count(productCategories, WHERE()),

      tenantDb(params.tenant).query.productCategories.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      productCategories: listProductCategories,
    }
  })
}

export const listProductCategories = Object.assign(getListProductCategories, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
