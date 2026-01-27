import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deletePriceSet(app: FastifyTypedInstance) {
  app.delete(
    '/price-lists/sets/:priceSetId',
    {
      schema: {
        tags: ['Price Sets'],
        summary: 'Delete a price set',
        operationId: 'deletePriceSet',
        params: z.object({
          priceSetId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { priceSetId } = request.params

      const priceSet = await tenant.queries.priceSets.getPriceSet({
        tenant: tenant.name,
        priceSetId,
      })

      if (!priceSet) {
        throw new BadRequestError({
          code: 'PRICE_SET_NOT_FOUND',
          message: 'Price set not found.',
        })
      }

      await tenant.schema(({ priceSets }) =>
        tenant.db.delete(priceSets).where(orm.eq(priceSets.id, priceSetId)),
      )

      return reply.status(204).send()
    },
  )
}
