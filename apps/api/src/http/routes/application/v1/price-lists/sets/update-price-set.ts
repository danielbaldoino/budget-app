import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { orm } from '@workspace/db'
import { CurrencyCode } from '@workspace/db/tenant/enums'
import { z } from 'zod'

export async function updatePriceSet(app: FastifyTypedInstance) {
  app.patch(
    '/price-lists/:priceListId/sets/:priceSetId',
    {
      schema: {
        tags: ['Price Sets'],
        summary: 'Update a price set',
        operationId: 'updatePriceSet',
        body: z.object({
          prices: z.array(
            z.object({
              currencyCode: z.enum(CurrencyCode),
              amount: z.number().nonnegative(),
            }),
          ),
        }),
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

      const { prices: pricesData } = request.body

      const duplicatedPrice = findDuplicate(
        pricesData,
        (price) => price.currencyCode,
      )

      if (duplicatedPrice) {
        throw new BadRequestError({
          code: 'PRICE_DUPLICATED',
          message: `Price has currency code "${duplicatedPrice.currencyCode}" that is duplicated.`,
        })
      }

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
