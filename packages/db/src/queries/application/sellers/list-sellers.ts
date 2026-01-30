import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'referenceId', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListSellersParams = {
  tenant: string
}

type ListSellersFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListSellers(
  params: ListSellersParams,
  filters: ListSellersFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ sellers }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'referenceId') {
          searchCondition.push(
            ilike(sellers.referenceId, `%${filters.search}%`),
          )
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(sellers.name, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(sellers.name)
      }

      return orderFn(sellers.createdAt)
    }

    const [count, listSellers] = await Promise.all([
      db.$count(sellers, WHERE()),

      tenantDb(params.tenant).query.sellers.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      sellers: listSellers,
    }
  })
}

export const listSellers = Object.assign(getListSellers, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
