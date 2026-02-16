import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteCarrier(app: FastifyTypedInstance) {
  app.delete(
    '/carriers/:carrierId',
    {
      schema: {
        tags: ['Carriers'],
        summary: 'Delete a carrier',
        operationId: 'deleteCarrier',
        params: z.object({
          carrierId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
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

      await tenant.schema(({ carriers }) =>
        tenant.db.delete(carriers).where(orm.eq(carriers.id, carrierId)),
      )

      return reply.status(204).send()
    },
  )
}
