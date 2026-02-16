import { type SQL, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'code', 'name'] as const
const SORT_BY = ['code', 'name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListCarriersParams = {
  tenant: string
}

type ListCarriersFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  active?: boolean
  page: number
  pageSize: number
}

async function getListCarriers(
  params: ListCarriersParams,
  filters: ListCarriersFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ carriers }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'code') {
          searchCondition.push(ilike(carriers.code, `%${filters.search}%`))
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(carriers.name, `%${filters.search}%`))
        }
      }

      if (filters.active !== undefined) {
        searchCondition.push(eq(carriers.active, filters.active))
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'code') {
        return orderFn(carriers.code)
      }

      if (filters.sortBy === 'name') {
        return orderFn(carriers.name)
      }

      return orderFn(carriers.createdAt)
    }

    const [count, listCarriers] = await Promise.all([
      db.$count(carriers, WHERE()),

      tenantDb(params.tenant).query.carriers.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      carriers: listCarriers,
    }
  })
}

export const listCarriers = Object.assign(getListCarriers, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
