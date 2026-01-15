import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteStockLocation(app: FastifyTypedInstance) {
  app.delete(
    '/stock-locations/:stockLocationId',
    {
      schema: {
        tags: ['Stock Locations'],
        summary: 'Delete a stock location',
        operationId: 'deleteStockLocation',
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

      await tenant.schema(({ stockLocations }) =>
        tenant.db
          .delete(stockLocations)
          .where(orm.eq(stockLocations.id, stockLocationId)),
      )

      return reply.status(204).send()
    },
  )
}
