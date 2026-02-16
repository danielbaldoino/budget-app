import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/tenant/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } = queries.users.listUsersWithRelations

export async function listUsers(app: FastifyTypedInstance) {
  app.get(
    '/users',
    {
      schema: {
        tags: ['User'],
        description: 'Get all users',
        operationId: 'listUsers',
        querystring: z.object({
          search: z.string().optional(),
          filterBy: z.enum(FILTER_BY).optional().default('username'),
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
                  username: z.string(),
                  seller: z
                    .object({
                      id: z.string(),
                      referenceId: z.string().nullable(),
                      name: z.string(),
                      createdAt: z.date(),
                      updatedAt: z.date(),
                    })
                    .nullable(),
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
      const { user } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(user.id)

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, users } =
        await tenant.queries.users.listUsersWithRelations(
          { tenant: tenant.name },
          { search, filterBy, sortBy, order, page, pageSize },
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
