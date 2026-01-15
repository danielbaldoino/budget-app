import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateStockLocation(app: FastifyTypedInstance) {
  app.patch(
    '/stock-locations/:stockLocationId',
    {
      schema: {
        tags: ['Stock Locations'],
        summary: 'Update a stock location',
        operationId: 'updateStockLocation',
        body: z.object({
          name: z.string(),
        }),
        params: z.object({
          stockLocationId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { stockLocationId } = request.params

      const stockLocation =
        await tenant.queries.stockLocations.getStockLocation({
          tenant: tenant.name,
          stockLocationId,
        })

      if (!stockLocation) {
        throw new BadRequestError({
          code: 'STOCK_LOCATION_NOT_FOUND',
          message: 'Stock location not found.',
        })
      }

      const { name } = request.body

      const stockLocationByName =
        await tenant.queries.stockLocations.getStockLocationByName({
          tenant: tenant.name,
          name,
          not: { stockLocationId },
        })

      if (stockLocationByName) {
        throw new BadRequestError({
          code: 'STOCK_LOCATION_NAME_ALREADY_EXISTS',
          message: 'Stock location name already exists.',
        })
      }

      await tenant.schema(({ stockLocations }) =>
        tenant.db
          .update(stockLocations)
          .set({
            name,
          })
          .where(orm.eq(stockLocations.id, stockLocationId)),
      )

      return reply.status(204).send()
    },
  )
}
