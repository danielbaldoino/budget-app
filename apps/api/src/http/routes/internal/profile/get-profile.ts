import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { tenantAuthenticate } from '@/http/middlewares/internal/tenant-authenticate'
import { tenantDatabase } from '@/http/middlewares/internal/tenant-database'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getProfile(app: FastifyTypedInstance) {
  app
    .register(tenantDatabase)
    .register(tenantAuthenticate)
    .get(
      '/profile',
      {
        schema: {
          tags: ['[Internal] Profile'],
          description: 'Get authenticated user profile',
          response: withDefaultErrorResponses({
            200: z
              .object({
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  username: z.string(),
                  password: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
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
