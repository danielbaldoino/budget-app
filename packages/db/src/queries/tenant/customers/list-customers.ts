import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  exists,
  getTableColumns,
  ilike,
  or,
  sql,
} from 'drizzle-orm'

import { db } from '../../../db'
import { buildRelationManyQuery } from '../../../lib/utils'
import { tenantSchema } from '../../../tenant'

const FILTER_BY = [
  'all',
  'referenceId',
  'name',
  'document',
  'addresses.street',
] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListCustomersWithRelationsParams = {
  tenant: string
}

type ListCustomersWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListCustomersWithRelations(
  params: ListCustomersWithRelationsParams,
  filters: ListCustomersWithRelationsFiltersParams,
) {
  return tenantSchema(params.tenant, async ({ customers, addresses }) => {
    const addressesSubQuery = buildRelationManyQuery({
      as: 'addresses',
      table: addresses,
      where: eq(addresses.customerId, customers.id),
    })

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

        if (
          filters.filterBy === 'all' ||
          filters.filterBy.startsWith('addresses.')
        ) {
          const addressesSearchCondition: SQL[] = []

          if (
            filters.filterBy === 'all' ||
            filters.filterBy === 'addresses.street'
          ) {
            addressesSearchCondition.push(
              ilike(addresses.street, `%${filters.search}%`),
            )
          }

          searchCondition.push(
            exists(
              db
                .select({ exists: sql`1` })
                .from(addresses)
                .where(
                  and(
                    eq(addresses.customerId, customers.id),
                    or(...addressesSearchCondition),
                  ),
                ),
            ),
          )
        }
      }

      return or(...searchCondition)
    }

    const ORDER_BY = () => {
      const orderFn = filters.order === 'asc' ? asc : desc

      if (filters.sortBy === 'name') {
        return orderFn(customers.name)
      }

      return orderFn(customers.createdAt)
    }

    const [count, listCustomers] = await Promise.all([
      db.$count(customers, WHERE()),

      db
        .select({
          ...getTableColumns(customers),
          addresses: addressesSubQuery.data,
        })
        .from(customers)
        .leftJoinLateral(addressesSubQuery, sql`true`)
        .where(WHERE())
        .orderBy(ORDER_BY())
        .offset((filters.page - 1) * filters.pageSize)
        .limit(filters.pageSize),
    ])

    return {
      count,
      customers: listCustomers,
    }
  })
}

export const listCustomersWithRelations = Object.assign(
  getListCustomersWithRelations,
  { FILTER_BY, SORT_BY, ORDER },
)
