import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import {} from '@workspace/db/schema'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

export async function deleteApiKey(app: FastifyTypedInstance) {
  app.register(authenticate).delete(
    '/owned-workspace/api-keys/:apiKeyId',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Delete an API key',
        operationId: 'deleteApiKey',
        params: z.object({
          apiKeyId: z.string().uuid(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const {
        user: { id: userId },
      } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: userId })

      const { apiKeyId } = request.params

      await tenantSchemaTables(
        tSchema,
        async ({ apiKeys }) =>
          await db.delete(apiKeys).where(eq(apiKeys.id, apiKeyId)),
      )

      reply.status(204).send()
    },
  )
}
