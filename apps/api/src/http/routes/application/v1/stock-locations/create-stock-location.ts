import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function createStockLocation(app: FastifyTypedInstance) {
  app.post(
    '/stock-locations',
    {
      schema: {
        tags: ['Stock Locations'],
        summary: 'Create a new stock location',
        operationId: 'createStockLocation',
        body: z.object({
          name: z.string(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              stockLocationId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { name } = request.body

      const stockLocationByName =
        await tenant.queries.stockLocations.getStockLocationByName({
          tenant: tenant.name,
          name,
        })

      if (stockLocationByName) {
        throw new BadRequestError({
          code: 'STOCK_LOCATION_NAME_ALREADY_EXISTS',
          message: 'Stock location name already exists.',
        })
      }

      const [stockLocation] = await tenant.schema(({ stockLocations }) =>
        tenant.db
          .insert(stockLocations)
          .values({
            name,
          })
          .returning(),
      )

      if (!stockLocation) {
        throw new BadRequestError({
          code: 'STOCK_LOCATION_NOT_CREATED',
          message: 'Stock location not created.',
        })
      }

      return reply.status(201).send({
        stockLocationId: stockLocation.id,
      })
    },
  )
}
