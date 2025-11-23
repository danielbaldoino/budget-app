import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListStockLocationsParams = {
  tenant: string
}

type ListStockLocationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}
async function getListStockLocations(
  params: ListStockLocationsParams,
  filters: ListStockLocationsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ stockLocations }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(
            ilike(stockLocations.name, `%${filters.search}%`),
          )
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(stockLocations.name)
      }

      return orderFn(stockLocations.createdAt)
    }

    const [count, listStockLocations] = await Promise.all([
      db.$count(stockLocations, WHERE()),

      db
        .select()
        .from(stockLocations)
        .where(WHERE())
        .orderBy(ORDER_BY())
        .offset((filters.page - 1) * filters.pageSize)
        .limit(filters.pageSize),
    ])

    return {
      count,
      stockLocations: listStockLocations,
    }
  })
}

export const listStockLocations = Object.assign(getListStockLocations, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
