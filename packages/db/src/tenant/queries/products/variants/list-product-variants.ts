import { type SQL, and, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../../../db'
import { tenantDb, tenantSchema } from '../../../../tenant'

const FILTER_BY = ['all', 'name', 'sku'] as const
const SORT_BY = ['name', 'sku', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListProductVariantsWithRelationsParams = {
  tenant: string
  productId: string
  priceListId?: string
}

type ListProductVariantsWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListProductVariantsWithRelations(
  params: ListProductVariantsWithRelationsParams,
  filters: ListProductVariantsWithRelationsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ productVariants, priceSets }) => {
    const WHERE = () => {
      const searchCondition: SQL[] = []

      if (filters.search) {
        if (filters.filterBy === 'all' || filters.filterBy === 'name') {
          searchCondition.push(
            ilike(productVariants.name, `%${filters.search}%`),
          )
        }

        if (filters.filterBy === 'all' || filters.filterBy === 'sku') {
          searchCondition.push(
            ilike(productVariants.sku, `%${filters.search}%`),
          )
        }
      }

      return and(
        eq(productVariants.productId, params.productId),
        or(...searchCondition),
      )
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(productVariants.name)
      }

      if (filters.sortBy === 'sku') {
        return orderFn(productVariants.sku)
      }

      return orderFn(productVariants.createdAt)
    }

    const [count, listProductVariants] = await Promise.all([
      db.$count(productVariants, WHERE()),

      tenantDb(params.tenant).query.productVariants.findMany({
        where: WHERE(),
        orderBy: ORDER_BY(),
        offset: (filters.page - 1) * filters.pageSize,
        limit: filters.pageSize,
        with: {
          images: true,
          options: {
            with: {
              optionValue: {
                with: {
                  option: true,
                },
              },
            },
          },
          priceSets: {
            where: params.priceListId
              ? eq(priceSets.priceListId, params.priceListId)
              : undefined,
            with: {
              prices: true,
            },
          },
        },
      }),
    ])

    return {
      count,
      productVariants: listProductVariants,
    }
  })
}

export const listProductVariantsWithRelations = Object.assign(
  getListProductVariantsWithRelations,
  { FILTER_BY, SORT_BY, ORDER },
)

type ListProductVariantsWithOptionsParams = {
  tenant: string
  productId: string
  productVariantId?: string
}

export async function listProductVariantsWithOptions(
  params: ListProductVariantsWithOptionsParams,
) {
  return tenantSchema(params.tenant, async ({ productVariants }) => {
    const listProductVariants = await tenantDb(
      params.tenant,
    ).query.productVariants.findMany({
      where: and(
        eq(productVariants.productId, params.productId),
        params.productVariantId
          ? eq(productVariants.id, params.productVariantId)
          : undefined,
      ),
      with: {
        options: {
          with: {
            optionValue: {
              with: {
                option: true,
              },
            },
          },
        },
      },
    })

    return listProductVariants
  })
}
