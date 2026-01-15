import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function getUser(app: FastifyTypedInstance) {
  app.get(
    '/users/:userId',
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
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { user: authUser } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(authUser.id)

      const { userId } = request.params

      const [user] = await tenant.schema(({ users }) =>
        tenant.db.select().from(users).where(orm.eq(users.id, userId)).limit(1),
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
