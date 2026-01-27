import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deletePriceList(app: FastifyTypedInstance) {
  app.delete(
    '/price-lists/:priceListId',
    {
      schema: {
        tags: ['Price Lists'],
        summary: 'Delete a price list',
        operationId: 'deletePriceList',
        params: z.object({
          priceListId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { priceListId } = request.params

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

      await tenant.schema(({ priceLists }) =>
        tenant.db.delete(priceLists).where(orm.eq(priceLists.id, priceListId)),
      )

      return reply.status(204).send()
    },
  )
}
