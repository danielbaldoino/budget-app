import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteApiKey(app: FastifyTypedInstance) {
  app.delete(
    '/api-keys/:apiKeyId',
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
      const { user } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(user.id)

      const { apiKeyId } = request.params

      const apiKey = await tenant.schema(({ apiKeys }) =>
        tenant.db.query.apiKeys.findFirst({
          where: orm.eq(apiKeys.id, apiKeyId),
        }),
      )

      if (!apiKey) {
        throw new BadRequestError({
          code: 'API_KEY_NOT_FOUND',
          message: 'API key not found',
        })
      }

      await tenant.schema(({ apiKeys }) =>
        tenant.db.delete(apiKeys).where(orm.eq(apiKeys.id, apiKeyId)),
      )

      reply.status(204).send()
    },
  )
}
