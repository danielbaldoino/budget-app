import { type SQL, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'code', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListPaymentMethodsParams = {
  tenant: string
}

type ListPaymentMethodsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  active?: boolean
  page: number
  pageSize: number
}

async function getListPaymentMethods(
  params: ListPaymentMethodsParams,
  filters: ListPaymentMethodsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ paymentMethods }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'code') {
          searchCondition.push(
            ilike(paymentMethods.code, `%${filters.search}%`),
          )
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(
            ilike(paymentMethods.name, `%${filters.search}%`),
          )
        }
      }

      if (filters.active !== undefined) {
        searchCondition.push(eq(paymentMethods.active, filters.active))
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(paymentMethods.name)
      }

      return orderFn(paymentMethods.createdAt)
    }

    const [count, listPaymentMethods] = await Promise.all([
      db.$count(paymentMethods, WHERE()),

      tenantDb(params.tenant).query.paymentMethods.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      paymentMethods: listPaymentMethods,
    }
  })
}

export const listPaymentMethods = Object.assign(getListPaymentMethods, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
