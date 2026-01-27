import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { CurrencyCode } from '@workspace/db/tenant/enums'
import { z } from 'zod'

export async function updatePriceSet(app: FastifyTypedInstance) {
  app.patch(
    '/price-lists/sets/:priceSetId',
    {
      schema: {
        tags: ['Price Sets'],
        summary: 'Update a price set',
        operationId: 'updatePriceSet',
        body: z.object({
          prices: z.array(
            z.object({
              currencyCode: z.enum(CurrencyCode),
              amount: z.number(),
            }),
          ),
        }),
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

      const { prices: pricesData } = request.body

      await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ prices }) => {
          await tx.delete(prices).where(orm.eq(prices.priceSetId, priceSetId))

          if (pricesData.length) {
            await tx.insert(prices).values(
              pricesData.map((price) => ({
                priceSetId: priceSet.id,
                currencyCode: price.currencyCode,
                amount: price.amount,
              })),
            )
          }
        }),
      )

      return reply.status(204).send()
    },
  )
}
