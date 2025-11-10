import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
import { z } from 'zod'

export async function updateApiKey(app: FastifyTypedInstance) {
  app.register(authenticate).patch(
    '/owned-workspace/api-keys/:apiKeyId',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Update an API key',
        operationId: 'updateApiKey',
        params: z.object({
          apiKeyId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string(),
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
      const { name } = request.body

      await tenantSchema(tSchema, ({ apiKeys }) =>
        tenantDb(tSchema)
          .update(apiKeys)
          .set({
            name,
          })
          .where(orm.eq(apiKeys.id, apiKeyId)),
      )

      return reply.status(204).send()
    },
  )
}
