import { orm } from '@petshop/db'
import { queries } from '@petshop/db/queries'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { internalMiddleware } from '@/http/middlewares/internal'
import { BearerAuth } from '@/types/auth'

export async function deleteStockLocation(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(internalMiddleware)
    .delete(
      '/workspaces/:slug/stock-locations/:stockLocationId',
      {
        schema: {
          tags: ['[Internal] Stock Locations'],
          summary: 'Delete a stock location',
          operationId: 'deleteStockLocation',
          security: [{ [BearerAuth.INTERNAL]: [] }],
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

        await tenantSchema(({ stockLocations }) =>
          tenantDb
            .delete(stockLocations)
            .where(orm.eq(stockLocations.id, stockLocationId)),
        )

        return reply.status(204).send()
      },
    )
}
