import { type SQL, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListCartsWithRelationsParams = {
  tenant: string
  sellerId: string
}

type ListCartsWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListCartsWithRelations(
  params: ListCartsWithRelationsParams,
  filters: ListCartsWithRelationsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ carts }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = [eq(carts.sellerId, params.sellerId)]

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

    const [count, listCartsWithRelations] = await Promise.all([
      db.$count(carts, WHERE()),

      tenantDb(params.tenant).query.carts.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
        with: {
          cartItems: true,
        },
      }),
    ])

    return {
      count,
      carts: listCartsWithRelations,
    }
  })
}

export const listCartsWithRelations = Object.assign(getListCartsWithRelations, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
