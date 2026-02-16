import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function createCarrier(app: FastifyTypedInstance) {
  app.post(
    '/carriers',
    {
      schema: {
        tags: ['Carriers'],
        summary: 'Create a new carrier',
        operationId: 'createCarrier',
        body: z.object({
          code: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          active: z.boolean().optional().default(true),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              carrierId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { code, name, description, active } = request.body

      // Check if carrier with same code already exists
      const existingCarrier = await tenant.schema(({ carriers }) =>
        tenant.db.query.carriers.findFirst({
          where: orm.eq(carriers.code, code),
        }),
      )

      if (existingCarrier) {
        throw new BadRequestError({
          code: 'CARRIER_CODE_ALREADY_EXISTS',
          message: 'Carrier code already exists.',
        })
      }

      const [carrier] = await tenant.schema(({ carriers }) =>
        tenant.db
          .insert(carriers)
          .values({
            code,
            name,
            description,
            active,
          })
          .returning(),
      )

      if (!carrier) {
        throw new BadRequestError({
          code: 'CARRIER_NOT_CREATED',
          message: 'Carrier not created.',
        })
      }

      return reply.status(201).send({
        carrierId: carrier.id,
      })
    },
  )
}
