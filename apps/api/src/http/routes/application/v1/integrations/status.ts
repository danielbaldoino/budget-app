import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function status(app: FastifyTypedInstance) {
  app.get(
    '/status',
    {
      schema: {
        tags: ['Default'],
        description: 'Check the status of the integrations API',
        operationId: 'getStatus',
        response: withDefaultErrorResponses({
          201: z
            .object({
              status: z.string(),
              timestamp: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
    }),
  )
}
