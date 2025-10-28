import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import {} from '@workspace/db/schema'
import { tenantSchemaTables } from '@workspace/db/tenant'
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

      const { userId: userIdToDelete } = request.params

      await tenantSchemaTables(
        tSchema,
        async ({ users }) =>
          await db.delete(users).where(eq(users.id, userIdToDelete)),
      )

      reply.status(204).send()
    },
  )
}
