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
import { db } from '../../../../../../db'
import { buildRelationFirstQuery } from '../../../../../../lib/utils'
import { tenantSchema } from '../../../../../../tenant'

const FILTER_BY = ['all', 'stockedQuantity', 'location.name'] as const
const SORT_BY = ['stockedQuantity', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

type ListInventoryLevelsWithRelationsParams = {
  tenant: string
  inventoryItemId: string
}

type ListInventoryLevelsWithRelationsFiltersParams = {
  search?: string
  filterBy: (typeof FILTER_BY)[number]
  sortBy: (typeof SORT_BY)[number]
  order: (typeof ORDER)[number]
  page: number
  pageSize: number
}

async function getListInventoryLevelsWithRelations(
  params: ListInventoryLevelsWithRelationsParams,
  filters: ListInventoryLevelsWithRelationsFiltersParams,
) {
  return tenantSchema(
    params.tenant,
    async ({ inventoryLevels, stockLocations }) => {
      const stockLocationsSubQuery = buildRelationFirstQuery({
        as: 'location',
        table: stockLocations,
        where: eq(stockLocations.id, inventoryLevels.locationId),
      })

      const WHERE = () => {
        const searchCondition: SQL[] = []

        if (filters.search) {
          if (
            filters.filterBy === 'all' ||
            filters.filterBy === 'stockedQuantity'
          ) {
            searchCondition.push(
              ilike(inventoryLevels.stockedQuantity, `%${filters.search}%`),
            )
          }

          if (
            filters.filterBy === 'all' ||
            filters.filterBy.startsWith('location.')
          ) {
            const locationSearchCondition: SQL[] = []

            if (
              filters.filterBy === 'all' ||
              filters.filterBy === 'location.name'
            ) {
              locationSearchCondition.push(
                ilike(stockLocations.name, `%${filters.search}%`),
              )
            }

            searchCondition.push(
              exists(
                db
                  .select({ exists: sql`1` })
                  .from(stockLocations)
                  .where(
                    and(
                      eq(stockLocations.id, inventoryLevels.locationId),
                      or(...locationSearchCondition),
                    ),
                  ),
              ),
            )
          }
        }

        return and(
          eq(inventoryLevels.inventoryItemId, params.inventoryItemId),
          or(...searchCondition),
        )
      }

      const ORDER_BY = () => {
        const orderFn = filters.order === 'asc' ? asc : desc

        if (filters.sortBy === 'stockedQuantity') {
          return orderFn(inventoryLevels.stockedQuantity)
        }

        return orderFn(inventoryLevels.createdAt)
      }

      const [count, listInventoryLevels] = await Promise.all([
        db.$count(inventoryLevels, WHERE()),

        db
          .select({
            ...getTableColumns(inventoryLevels),
            location: stockLocationsSubQuery.data,
          })
          .from(inventoryLevels)
          .leftJoinLateral(stockLocationsSubQuery, sql`true`)
          .where(WHERE())
          .orderBy(ORDER_BY())
          .offset((filters.page - 1) * filters.pageSize)
          .limit(filters.pageSize),
      ])

      return {
        count,
        inventoryLevels: listInventoryLevels,
      }
    },
  )
}

export const listInventoryLevelsWithRelations = Object.assign(
  getListInventoryLevelsWithRelations,
  { FILTER_BY, SORT_BY, ORDER },
)
