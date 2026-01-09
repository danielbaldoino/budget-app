import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getProfile(app: FastifyTypedInstance) {
  app.get(
    '/profile',
    {
      schema: {
        tags: ['Profile'],
        description: 'Get authenticated user profile',
        operationId: 'getProfile',
        response: withDefaultErrorResponses({
          200: z
            .object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                username: z.string(),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const user = request.internal.authUser

      return { user }
    },
  )
}
