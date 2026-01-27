import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
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
                        currencyCode: z.string(),
                        amount: z.number(),
                        createdAt: z.coerce.date(),
                        updatedAt: z.coerce.date(),
                      }),
                    ),
                    productVariantId: z.string().nullable(),
                    createdAt: z.coerce.date(),
                    updatedAt: z.coerce.date(),
                  }),
                ),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
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
