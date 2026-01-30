import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getCarrier(app: FastifyTypedInstance) {
  app.get(
    '/carriers/:carrierId',
    {
      schema: {
        tags: ['Carriers'],
        summary: 'Get carrier details',
        operationId: 'getCarrier',
        params: z.object({
          carrierId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              carrier: z.object({
                id: z.string(),
                code: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                active: z.boolean(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { carrierId } = request.params

      const carrier = await tenant.queries.carriers.getCarrier({
        tenant: tenant.name,
        carrierId,
      })

      if (!carrier) {
        throw new BadRequestError({
          code: 'CARRIER_NOT_FOUND',
          message: 'Carrier not found.',
        })
      }

      return { carrier }
    },
  )
}
