import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function getApiKey(app: FastifyTypedInstance) {
  app.get(
    '/api-keys/:apiKeyId',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Get an API key',
        operationId: 'getApiKey',
        params: z.object({
          apiKeyId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              apiKey: z.object({
                id: z.string(),
                name: z.string(),
                token: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
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

      return { apiKey }
    },
  )
}
