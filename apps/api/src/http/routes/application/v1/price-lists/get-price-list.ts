import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { CurrencyCode } from '@workspace/db/tenant/enums'
import { z } from 'zod'

export async function getPriceList(app: FastifyTypedInstance) {
  app.get(
    '/price-lists/:priceListId',
    {
      schema: {
        tags: ['Price Lists'],
        summary: 'Get price list details',
        operationId: 'getPriceList',
        params: z.object({
          priceListId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              priceList: z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                priceSets: z.array(
                  z.object({
                    id: z.string(),
                    prices: z.array(
                      z.object({
                        id: z.string(),
                        currencyCode: z.enum(CurrencyCode),
                        amount: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      }),
                    ),
                    productVariantId: z.string().nullable(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  }),
                ),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { priceListId } = request.params

      const priceList =
        await tenant.queries.priceLists.getPriceListWithRelations({
          tenant: tenant.name,
          priceListId,
        })

      if (!priceList) {
        throw new BadRequestError({
          code: 'PRICE_LIST_NOT_FOUND',
          message: 'Price list not found.',
        })
      }

      return { priceList }
    },
  )
}
