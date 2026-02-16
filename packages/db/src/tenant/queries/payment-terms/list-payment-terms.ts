import { type SQL, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantDb, tenantSchema } from '../../../tenant'

const FILTER_BY = ['all', 'code', 'name'] as const
const SORT_BY = ['code', 'name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListPaymentTermsParams = {
  tenant: string
}

type ListPaymentTermsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  active?: boolean
  page: number
  pageSize: number
}

async function getListPaymentTerms(
  params: ListPaymentTermsParams,
  filters: ListPaymentTermsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ paymentTerms }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'code') {
          searchCondition.push(ilike(paymentTerms.code, `%${filters.search}%`))
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(ilike(paymentTerms.name, `%${filters.search}%`))
        }
      }

      if (filters.active !== undefined) {
        searchCondition.push(eq(paymentTerms.active, filters.active))
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'code') {
        return orderFn(paymentTerms.code)
      }

      if (filters.sortBy === 'name') {
        return orderFn(paymentTerms.name)
      }

      return orderFn(paymentTerms.createdAt)
    }

    const [count, listPaymentTerms] = await Promise.all([
      db.$count(paymentTerms, WHERE()),

      tenantDb(params.tenant).query.paymentTerms.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
      }),
    ])

    return {
      count,
      paymentTerms: listPaymentTerms,
    }
  })
}

export const listPaymentTerms = Object.assign(getListPaymentTerms, {
  FILTER_BY,
  SORT_BY,
  ORDER,
})
