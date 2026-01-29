import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updatePriceList(app: FastifyTypedInstance) {
  app.patch(
    '/price-lists/:priceListId',
    {
      schema: {
        tags: ['Price Lists'],
        summary: 'Update a price list',
        operationId: 'updatePriceList',
        body: z.object({
          name: z.string(),
          description: z.string().nullish(),
        }),
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

      const { name, description } = request.body

      const priceListByName =
        await tenant.queries.priceLists.getPriceListByName({
          tenant: tenant.name,
          name,
          not: { priceListId },
        })

      if (priceListByName) {
        throw new BadRequestError({
          code: 'PRICE_LIST_NAME_ALREADY_EXISTS',
          message: 'Price list name already exists.',
        })
      }

      await tenant.schema(({ priceLists }) =>
        tenant.db
          .update(priceLists)
          .set({
            name,
            description,
          })
          .where(orm.eq(priceLists.id, priceListId)),
      )

      return reply.status(204).send()
    },
  )
}
