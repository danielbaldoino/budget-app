import { type SQL, asc, desc, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListPriceListsParams = {
  tenant: string
}

type ListPriceListsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}
async function getListPriceLists(
  params: ListPriceListsParams,
  filters: ListPriceListsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ priceLists }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(priceLists.name, `%${filters.search}%`))
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(priceLists.name)
      }

      return orderFn(priceLists.createdAt)
    }

    const [count, listPriceLists] = await Promise.all([
      db.$count(priceLists, WHERE()),

      tenantDb(params.tenant).query.priceLists.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      priceLists: listPriceLists,
    }
  })
}

export const listPriceLists = Object.assign(getListPriceLists, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
