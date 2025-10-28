import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

export async function getUser(app: FastifyTypedInstance) {
  app.register(authenticate).get(
    '/owned-workspace/users/:userId',
    {
      schema: {
        tags: ['User'],
        description: 'Get a user',
        operationId: 'getUser',
        params: z.object({
          userId: z.string().uuid(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                username: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const {
        user: { id: userId },
      } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: userId })

      const { userId: targetUserId } = request.params

      const [user] = await tenantSchemaTables(
        tSchema,
        async ({ users }) =>
          await db
            .select({
              id: users.id,
              name: users.name,
              username: users.username,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, targetUserId))
            .limit(1),
      )

      if (!user) {
        throw new BadRequestError({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        })
      }

      return { user }
    },
  )
}
