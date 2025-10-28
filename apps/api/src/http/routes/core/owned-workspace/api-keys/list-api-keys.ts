import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { type SQL, and, asc, ilike } from '@workspace/db/orm'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

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
          orderBy: z.enum(['id', 'name']).optional().default('id'),
          page: z.coerce.number().min(0).optional().default(1),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              apiKeys: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  token: z.string(),
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

      const { apiKeys, total } = await tenantSchemaTables(
        tSchema,
        async ({ apiKeys }) => {
          const conditions: SQL[] = []

          if (search) {
            conditions.push(ilike(apiKeys.name, `%${search}%`))
          }

          const [result, count] = await Promise.all([
            db
              .select({
                id: apiKeys.id,
                name: apiKeys.name,
                token: apiKeys.token,
                createdAt: apiKeys.createdAt,
                updatedAt: apiKeys.updatedAt,
              })
              .from(apiKeys)
              .orderBy(asc(apiKeys[orderBy]))
              .offset((page - 1) * 2)
              .limit(10)
              .where(and(...conditions)),

            db.$count(apiKeys, and(...conditions)),
          ])

          return { apiKeys: result, total: count }
        },
      )

      return {
        apiKeys,
        meta: { total },
      }
    },
  )
}
