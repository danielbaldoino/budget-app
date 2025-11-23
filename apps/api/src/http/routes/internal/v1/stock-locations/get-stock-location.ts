import { queries } from '@petshop/db/queries'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { internalMiddleware } from '@/http/middlewares/internal'
import { BearerAuth } from '@/types/auth'

export async function getStockLocation(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(internalMiddleware)
    .get(
      '/workspaces/:slug/stock-locations/:stockLocationId',
      {
        schema: {
          tags: ['[Internal] Stock Locations'],
          summary: 'Get stock location details',
          operationId: 'getStockLocation',
          security: [{ [BearerAuth.INTERNAL]: [] }],
          params: z.object({
            slug: z.string(),
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
        const { slug, stockLocationId } = request.params

        const { tenant } = await request.internal.getCurrentUser(slug)

        const stockLocation =
          await queries.internal.stockLocations.getStockLocationWithRelations({
            tenant,
            stockLocationId,
          })

        if (!stockLocation) {
          throw new BadRequestError({
            code: 'stock-location-not-found',
            message: 'Stock location not found.',
          })
        }

        return { stockLocation }
      },
    )
}
