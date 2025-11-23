import { orm } from '@petshop/db'
import { queries } from '@petshop/db/queries'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { internalMiddleware } from '@/http/middlewares/internal'
import { BearerAuth } from '@/types/auth'

export async function updateStockLocation(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(internalMiddleware)
    .patch(
      '/workspaces/:slug/stock-locations/:stockLocationId',
      {
        schema: {
          tags: ['[Internal] Stock Locations'],
          summary: 'Update a stock location',
          operationId: 'updateStockLocation',
          security: [{ [BearerAuth.INTERNAL]: [] }],
          body: z.object({
            name: z.string(),
          }),
          params: z.object({
            slug: z.string(),
            stockLocationId: z.string(),
          }),
          response: withDefaultErrorResponses({
            204: z.null().describe('Success'),
          }),
        },
      },
      async (request, reply) => {
        const { slug, stockLocationId } = request.params

        const { tenant, tenantSchema, tenantDb } =
          await request.internal.getCurrentUser(slug)

        const stockLocation =
          await queries.internal.stockLocations.getStockLocation({
            tenant,
            stockLocationId,
          })

        if (!stockLocation) {
          throw new BadRequestError({
            code: 'stock-location-not-found',
            message: 'Stock location not found.',
          })
        }

        const { name } = request.body

        const stockLocationByName =
          await queries.internal.stockLocations.getStockLocationByName({
            tenant,
            name,
            not: {
              stockLocationId,
            },
          })

        if (stockLocationByName) {
          throw new BadRequestError({
            code: 'stock-location-name-already-exists',
            message: 'Stock location name already exists.',
          })
        }

        await tenantSchema(({ stockLocations }) =>
          tenantDb
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
