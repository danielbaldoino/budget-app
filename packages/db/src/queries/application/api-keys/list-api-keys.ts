import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListApiKeysParams = {
  tenant: string
}

type ListApiKeysFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListApiKeys(
  params: ListApiKeysParams,
  filters: ListApiKeysFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ apiKeys }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(apiKeys.name, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(apiKeys.name)
      }

      return orderFn(apiKeys.createdAt)
    }

    const [count, listApiKeys] = await Promise.all([
      db.$count(apiKeys, WHERE()),

      db
        .select()
        .from(apiKeys)
        .where(WHERE())
        .orderBy(ORDER_BY())
        .offset((filters.page - 1) * filters.pageSize)
        .limit(filters.pageSize),
    ])

    return {
      count,
      apiKeys: listApiKeys,
    }
  })
}

export const listApiKeys = Object.assign(getListApiKeys, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
