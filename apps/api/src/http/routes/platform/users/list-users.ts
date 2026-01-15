import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } = queries.application.users.listUsers

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
      const { user } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(user.id)

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, users } = await tenant.queries.users.listUsers(
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
