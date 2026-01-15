import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getStockLocation(app: FastifyTypedInstance) {
  app.get(
    '/stock-locations/:stockLocationId',
    {
      schema: {
        tags: ['Stock Locations'],
        summary: 'Get stock location details',
        operationId: 'getStockLocation',
        params: z.object({
          stockLocationId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              stockLocation: z.object({
                id: z.string(),
                name: z.string(),
                addresses: z.array(
                  z.object({
                    id: z.string(),
                    street: z.string().nullable(),
                    number: z.string().nullable(),
                    complement: z.string().nullable(),
                    neighborhood: z.string().nullable(),
                    city: z.string().nullable(),
                    state: z.string().nullable(),
                    country: z.string().nullable(),
                    zipCode: z.string().nullable(),
                    reference: z.string().nullable(),
                    createdAt: z.coerce.date(),
                    updatedAt: z.coerce.date(),
                  }),
                ),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { stockLocationId } = request.params

      const stockLocation =
        await tenant.queries.stockLocations.getStockLocationWithRelations({
          tenant: tenant.name,
          stockLocationId,
        })

      if (!stockLocation) {
        throw new BadRequestError({
          code: 'STOCK_LOCATION_NOT_FOUND',
          message: 'Stock location not found.',
        })
      }

      return { stockLocation }
    },
  )
}
