import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListCartsParams = {
  tenant: string
}

type ListCartsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListCarts(
  params: ListCartsParams,
  filters: ListCartsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ carts }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(carts.name, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(carts.name)
      }

      return orderFn(carts.createdAt)
    }

    const [count, listCarts] = await Promise.all([
      db.$count(carts, WHERE()),

      tenantDb(params.tenant).query.carts.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      carts: listCarts,
    }
  })
}

export const listCarts = Object.assign(getListCarts, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
