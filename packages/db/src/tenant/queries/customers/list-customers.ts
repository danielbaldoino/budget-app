import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'referenceId', 'name', 'document'] as const
const SORT_BY = ['referenceId', 'name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListCustomersParams = {
  tenant: string
}

type ListCustomersFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListCustomers(
  params: ListCustomersParams,
  filters: ListCustomersFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ customers }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'referenceId') {
          searchCondition.push(
            ilike(customers.referenceId, `%${filters.search}%`),
          )
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(customers.name, `%${filters.search}%`))
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'document') {
          searchCondition.push(ilike(customers.document, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'referenceId') {
        return orderFn(customers.referenceId)
      }

      if (filters.sortBy === 'name') {
        return orderFn(customers.name)
      }

      return orderFn(customers.createdAt)
    }

    const [count, listCustomers] = await Promise.all([
      db.$count(customers, WHERE()),

      tenantDb(params.tenant).query.customers.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      customers: listCustomers,
    }
  })
}

export const listCustomers = Object.assign(getListCustomers, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
