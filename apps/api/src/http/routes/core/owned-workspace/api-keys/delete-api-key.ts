import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { queries } from '@workspace/db/queries'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
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

      const apiKey = await queries.tenant.apiKeys.getApiKey({
        tenant: tSchema,
        apiKeyId,
      })

      if (!apiKey) {
        throw new BadRequestError({
          code: 'API_KEY_NOT_FOUND',
          message: 'API key not found',
        })
      }

      await tenantSchema(tSchema, ({ apiKeys }) =>
        tenantDb(tSchema).delete(apiKeys).where(orm.eq(apiKeys.id, apiKeyId)),
      )

      reply.status(204).send()
    },
  )
}
