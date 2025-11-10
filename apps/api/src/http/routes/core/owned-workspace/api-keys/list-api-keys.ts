import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
import { z } from 'zod'

const FILTER_BY = ['all', 'name'] as const
const SORT_BY = ['name', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

export async function listApiKeys(app: FastifyTypedInstance) {
  app.register(authenticate).get(
    '/owned-workspace/api-keys',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Get all API keys',
        operationId: 'listApiKeys',
        querystring: z.object({
          search: z.string().optional(),
          filterBy: z.enum(FILTER_BY).optional().default('name'),
          sortBy: z.enum(SORT_BY).optional().default('createdAt'),
          order: z.enum(ORDER).optional().default('asc'),
          page: z.coerce.number().positive().optional().default(1),
          pageSize: z.coerce
            .number()
            .positive()
            .min(10)
            .max(100)
            .optional()
            .default(50),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              meta: z.object({
                search: z.string().optional(),
                filterBy: z.enum(FILTER_BY),
                sortBy: z.enum(SORT_BY),
                order: z.enum(ORDER),
                count: z.number(),
                page: z.number(),
                pageSize: z.number(),
              }),
              apiKeys: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  token: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                }),
              ),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { user } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: user.id })

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, apiKeys } = await tenantSchema(
        tSchema,
        async ({ apiKeys }) => {
          const WHERE = () => {
            const searchConditions: orm.SQL[] = []

            if (search) {
              if (filterBy === 'all' || filterBy === 'name') {
                searchConditions.push(orm.ilike(apiKeys.name, `%${search}%`))
              }

              return searchConditions.length
                ? orm.or(...searchConditions)
                : undefined
            }
          }

          const ORDER_BY = () => {
            const orderFn = order === 'asc' ? orm.asc : orm.desc

            const orderConditions: orm.SQL[] = []

            if (sortBy === 'name') {
              orderConditions.push(orderFn(apiKeys.name))
            }

            if (sortBy === 'createdAt') {
              orderConditions.push(orderFn(apiKeys.createdAt))
            }

            return orderConditions
          }

          const [[count], listApiKeys] = await Promise.all([
            tenantDb(tSchema)
              .select({
                count: orm.count(apiKeys.id),
              })
              .from(apiKeys)
              .where(WHERE()),

            tenantDb(tSchema).query.apiKeys.findMany({
              where: WHERE(),
              orderBy: ORDER_BY(),
              offset: (page - 1) * pageSize,
              limit: pageSize,
            }),
          ])

          return {
            count: count?.count || 0,
            apiKeys: listApiKeys,
          }
        },
      )

      return {
        meta: {
          search,
          filterBy,
          sortBy,
          order,
          count,
          page,
          pageSize,
        },
        apiKeys,
      }
    },
  )
}
