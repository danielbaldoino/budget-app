import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { type SQL, and, asc, ilike } from '@workspace/db/orm'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

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
          orderBy: z.enum(['id', 'name']).optional().default('id'),
          page: z.coerce.number().min(0).optional().default(1),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              users: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  username: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                }),
              ),
              meta: z.object({
                total: z.number(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { user } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: user.id })

      const { search, orderBy, page } = request.query

      const { users, total } = await tenantSchemaTables(
        tSchema,
        async ({ users }) => {
          const conditions: SQL[] = []

          if (search) {
            conditions.push(ilike(users.name, `%${search}%`))
          }

          const [result, count] = await Promise.all([
            db
              .select({
                id: users.id,
                name: users.name,
                username: users.username,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
              })
              .from(users)
              .orderBy(asc(users[orderBy]))
              .offset((page - 1) * 2)
              .limit(20)
              .where(and(...conditions)),

            db.$count(users, and(...conditions)),
          ])

          return { users: result, total: count }
        },
      )

      return {
        users,
        meta: { total },
      }
    },
  )
}
