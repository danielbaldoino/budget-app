import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListUsersParams = {
  tenant: string
}

type ListUsersFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListUsers(
  params: ListUsersParams,
  filters: ListUsersFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ users }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(users.name, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(users.name)
      }

      return orderFn(users.createdAt)
    }

    const [count, listUsers] = await Promise.all([
      db.$count(users, WHERE()),

      tenantDb(params.tenant).query.users.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      users: listUsers,
    }
  })
}

export const listUsers = Object.assign(getListUsers, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
