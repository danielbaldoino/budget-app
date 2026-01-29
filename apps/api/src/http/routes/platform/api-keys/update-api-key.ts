import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateApiKey(app: FastifyTypedInstance) {
  app.patch(
    '/api-keys/:apiKeyId',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Update an API key',
        operationId: 'updateApiKey',
        params: z.object({
          apiKeyId: z.string(),
        }),
        body: z.object({
          name: z.string().trim().min(3),
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
      const { name } = request.body

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
        tenant.db
          .update(apiKeys)
          .set({ name })
          .where(orm.eq(apiKeys.id, apiKeyId)),
      )

      return reply.status(204).send()
    },
  )
}
