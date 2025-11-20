import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
import { z } from 'zod'

export async function getApiKey(app: FastifyTypedInstance) {
  app.register(authenticate).get(
    '/owned-workspace/api-keys/:apiKeyId',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Get an API key',
        operationId: 'getApiKey',
        params: z.object({
          apiKeyId: z.string().uuid(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              apiKey: z.object({
                id: z.string(),
                name: z.string(),
                token: z.string(),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const {
        user: { id: userId },
      } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: userId })

      const { apiKeyId } = request.params

      const apiKey = await tenantSchema(tSchema, ({ apiKeys }) =>
        tenantDb(tSchema).query.apiKeys.findFirst({
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
