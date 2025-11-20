import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { queries } from '@workspace/db/queries'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
import { z } from 'zod'

export async function deleteUser(app: FastifyTypedInstance) {
  app.register(authenticate).delete(
    '/owned-workspace/users/:userId',
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
      const { user } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: user.id })

      const { userId } = request.params

      const userFound = await queries.tenant.users.getUser({
        tenant: tSchema,
        userId,
      })

      if (!userFound) {
        throw new BadRequestError({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        })
      }

      await tenantSchema(tSchema, ({ users }) =>
        tenantDb(tSchema).delete(users).where(orm.eq(users.id, userId)),
      )

      reply.status(204).send()
    },
  )
}
