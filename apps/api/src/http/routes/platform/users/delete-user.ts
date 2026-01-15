import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteUser(app: FastifyTypedInstance) {
  app.delete(
    '/users/:userId',
    {
      schema: {
        tags: ['User'],
        description: 'Delete a user',
        operationId: 'deleteUser',
        params: z.object({
          userId: z.string().uuid(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { user: authUser } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(authUser.id)

      const { userId } = request.params

      const user = await tenant.schema(({ users }) =>
        tenant.db.query.users.findFirst({
          where: orm.eq(users.id, userId),
        }),
      )

      if (!user) {
        throw new BadRequestError({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        })
      }

      await tenant.schema(({ users }) =>
        tenant.db.delete(users).where(orm.eq(users.id, userId)),
      )

      reply.status(204).send()
    },
  )
}
