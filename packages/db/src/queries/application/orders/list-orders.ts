import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'referenceId', 'displayId'] as const
const SORT_BY = ['referenceId', 'displayId', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListOrdersWithRelationsParams = {
  tenant: string
}

type ListOrdersWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListOrdersWithRelations(
  params: ListOrdersWithRelationsParams,
  filters: ListOrdersWithRelationsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ orders }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'referenceId') {
          searchCondition.push(ilike(orders.referenceId, `%${filters.search}%`))
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'displayId') {
          searchCondition.push(ilike(orders.displayId, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'displayId') {
        return orderFn(orders.displayId)
      }

      return orderFn(orders.createdAt)
    }

    const [count, listOrders] = await Promise.all([
      db.$count(orders, WHERE()),

      tenantDb(params.tenant).query.orders.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
        with: {
          orderItems: true,
        },
      }),
    ])

    return {
      count,
      orders: listOrders,
    }
  })
}

export const listOrdersWithRelations = Object.assign(
  getListOrdersWithRelations,
  {
    FILTER_BY,
    SORT_BY,
    ORDER,
  },
)
