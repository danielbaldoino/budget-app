import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'username'] as const
const SORT_BY = ['username', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListUsersWithRelationsParams = {
  tenant: string
}

type ListUsersWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListUsersWithRelations(
  params: ListUsersWithRelationsParams,
  filters: ListUsersWithRelationsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ users }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'username') {
          searchCondition.push(ilike(users.username, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'username') {
        return orderFn(users.username)
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
        with: {
          seller: true,
        },
      }),
    ])

    return {
      count,
      users: listUsers,
    }
  })
}

export const listUsersWithRelations = Object.assign(getListUsersWithRelations, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
