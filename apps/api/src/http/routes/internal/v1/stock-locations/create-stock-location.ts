import { queries } from '@petshop/db/queries'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { internalMiddleware } from '@/http/middlewares/internal'
import { BearerAuth } from '@/types/auth'

export async function createStockLocation(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(internalMiddleware)
    .post(
      '/workspaces/:slug/stock-locations',
      {
        schema: {
          tags: ['[Internal] Stock Locations'],
          summary: 'Create a new stock location',
          operationId: 'createStockLocation',
          security: [{ [BearerAuth.INTERNAL]: [] }],
          body: z.object({
            name: z.string(),
          }),
          params: z.object({
            slug: z.string(),
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
        const { slug } = request.params

        const { tenant, tenantSchema, tenantDb } =
          await request.internal.getCurrentUser(slug)

        const { name } = request.body

        const stockLocationByName =
          await queries.internal.stockLocations.getStockLocationByName({
            tenant,
            name,
          })

        if (stockLocationByName) {
          throw new BadRequestError({
            code: 'stock-location-name-already-exists',
            message: 'Stock location name already exists.',
          })
        }

        const [stockLocation] = await tenantSchema(({ stockLocations }) =>
          tenantDb
            .insert(stockLocations)
            .values({
              name,
            })
            .returning(),
        )

        if (!stockLocation) {
          throw new BadRequestError({
            code: 'stock-location-not-created',
            message: 'Stock location not created.',
          })
        }

        return reply.status(201).send({
          stockLocationId: stockLocation.id,
        })
      },
    )
}
