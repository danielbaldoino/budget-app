import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateCarrier(app: FastifyTypedInstance) {
  app.patch(
    '/carriers/:carrierId',
    {
      schema: {
        tags: ['Carriers'],
        summary: 'Update a carrier',
        operationId: 'updateCarrier',
        body: z.object({
          code: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          active: z.boolean(),
        }),
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

      const { code, name, description, active } = request.body

      // Check if another carrier with same code already exists
      const existingCarrier = await tenant.schema(({ carriers }) =>
        tenant.db.query.carriers.findFirst({
          where: orm.and(
            orm.eq(carriers.code, code),
            orm.ne(carriers.id, carrierId),
          ),
        }),
      )

      if (existingCarrier) {
        throw new BadRequestError({
          code: 'CARRIER_CODE_ALREADY_EXISTS',
          message: 'Carrier code already exists.',
        })
      }

      await tenant.schema(({ carriers }) =>
        tenant.db
          .update(carriers)
          .set({
            code,
            name,
            description,
            active,
          })
          .where(orm.eq(carriers.id, carrierId)),
      )

      return reply.status(204).send()
    },
  )
}
