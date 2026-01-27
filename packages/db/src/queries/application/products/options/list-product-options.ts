import { type SQL, and, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../../../db'
import { tenantDb, tenantSchema } from '../../../../tenant'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListProductOptionsWithRelationsParams = {
  tenant: string
  productId: string
}

type ListProductOptionsWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListProductOptionsWithRelations(
  params: ListProductOptionsWithRelationsParams,
  filters: ListProductOptionsWithRelationsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ productOptions }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(
            ilike(productOptions.name, `%${filters.search}%`),
          )
        }
      }

      return and(
        eq(productOptions.productId, params.productId),
        or(...searchCondition),
      )
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(productOptions.name)
      }

      return orderFn(productOptions.createdAt)
    }

    const [count, listProductOptions] = await Promise.all([
      db.$count(productOptions, WHERE()),

      tenantDb(params.tenant).query.productOptions.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
        with: {
          values: true,
        },
      }),
    ])

    return {
      count,
      productOptions: listProductOptions,
    }
  })
}

export const listProductOptionsWithRelations = Object.assign(
  getListProductOptionsWithRelations,
  { FILTER_BY, SORT_BY, ORDER },
)

type ListProductOptionsWithValuesParams = {
  tenant: string
  productId: string
}

export async function listProductOptionsWithValues(
  params: ListProductOptionsWithValuesParams,
) {
  return tenantSchema(params.tenant, async ({ productOptions }) => {
    const listProductOptions = await tenantDb(
      params.tenant,
    ).query.productOptions.findMany({
      where: eq(productOptions.productId, params.productId),
      with: {
        values: true,
      },
    })

    return listProductOptions
  })
}
