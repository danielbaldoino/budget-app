import { randomUUID } from 'node:crypto'
import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function createApiKey(app: FastifyTypedInstance) {
  app.post(
    '/api-keys',
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
      const { user } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(user.id)

      const { name } = request.body

      // Improve token generation strategy later
      const unique = randomUUID().replace(/-/g, '')
      const token = `key_${unique}`

      const [apiKey] = await tenant.schema(({ apiKeys }) =>
        tenant.db
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
