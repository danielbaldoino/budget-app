import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deletePriceSet(app: FastifyTypedInstance) {
  app.delete(
    '/price-lists/:priceListId/sets/:priceSetId',
    {
      schema: {
        tags: ['Price Sets'],
        summary: 'Delete a price set',
        operationId: 'deletePriceSet',
        params: z.object({
          priceListId: z.string(),
          priceSetId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { priceListId, priceSetId } = request.params

      const priceList = await tenant.queries.priceLists.getPriceList({
        tenant: tenant.name,
        priceListId,
      })

      if (!priceList) {
        throw new BadRequestError({
          code: 'PRICE_LIST_NOT_FOUND',
          message: 'Price list not found.',
        })
      }

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
        tenant.db
          .delete(priceSets)
          .where(
            orm.and(
              orm.eq(priceSets.id, priceSetId),
              orm.eq(priceSets.priceListId, priceListId),
            ),
          ),
      )

      return reply.status(204).send()
    },
  )
}
