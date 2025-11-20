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

export async function listUsers(app: FastifyTypedInstance) {
  app.register(authenticate).get(
    '/owned-workspace/users',
    {
      schema: {
        tags: ['User'],
        description: 'Get all users',
        operationId: 'listUsers',
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
              users: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  username: z.string(),
                  createdAt: z.coerce.date(),
                  updatedAt: z.coerce.date(),
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

      const { count, users } = await tenantSchema(
        tSchema,
        async ({ users }) => {
          const WHERE = () => {
            const searchConditions: orm.SQL[] = []

            if (search) {
              if (filterBy === 'all' || filterBy === 'name') {
                searchConditions.push(orm.ilike(users.name, `%${search}%`))
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
              orderConditions.push(orderFn(users.name))
            }

            if (sortBy === 'createdAt') {
              orderConditions.push(orderFn(users.createdAt))
            }

            return orderConditions
          }

          const [[count], listUsers] = await Promise.all([
            tenantDb(tSchema)
              .select({
                count: orm.count(users.id),
              })
              .from(users)
              .where(WHERE()),

            tenantDb(tSchema).query.users.findMany({
              where: WHERE(),
              orderBy: ORDER_BY(),
              offset: (page - 1) * pageSize,
              limit: pageSize,
            }),
          ])

          return {
            count: count?.count || 0,
            users: listUsers,
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
        users,
      }
    },
  )
}
