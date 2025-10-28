import { randomUUID } from 'node:crypto'
import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import {} from '@workspace/db/schema'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

export async function createApiKey(app: FastifyTypedInstance) {
  app.register(authenticate).post(
    '/owned-workspace/api-keys',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Create a new API key',
        operationId: 'createApiKey',
        body: z.object({
          name: z.string(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              token: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const {
        user: { id: userId },
      } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: userId })

      const { name } = request.body

      const unique = randomUUID().replace(/-/g, '')
      const token = `key_${unique}`

      const [apiKey] = await tenantSchemaTables(
        tSchema,
        async ({ apiKeys }) =>
          await db
            .insert(apiKeys)
            .values({
              name,
              token,
            })
            .returning(),
      )

      if (!apiKey) {
        throw new BadRequestError({
          code: 'API_KEY_CREATION_FAILED',
          message: 'Failed to create API key',
        })
      }

      return reply.status(201).send({ token })
    },
  )
}
