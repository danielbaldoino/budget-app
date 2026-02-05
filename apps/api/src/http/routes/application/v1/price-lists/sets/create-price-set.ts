import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { CurrencyCode } from '@workspace/db/tenant/enums'
import { z } from 'zod'

export async function createPriceSet(app: FastifyTypedInstance) {
  app.post(
    '/price-lists/:priceListId/sets',
    {
      schema: {
        tags: ['Price Sets'],
        summary: 'Create a new price set',
        operationId: 'createPriceSet',
        params: z.object({
          priceListId: z.string(),
        }),
        body: z.object({
          productVariantId: z.string(),
          prices: z.array(
            z.object({
              currencyCode: z.enum(CurrencyCode),
              amount: z.number().nonnegative(),
            }),
          ),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              priceSetId: z.string(),
            })
            .describe('Success'),
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

      const { productVariantId, prices: pricesData } = request.body

      const priceSetByProductVariantId =
        await tenant.queries.priceSets.getPriceSetByProductVariantId({
          tenant: tenant.name,
          productVariantId,
        })

      if (priceSetByProductVariantId) {
        throw new BadRequestError({
          code: 'PRICE_SET_ALREADY_EXISTS',
          message: 'Price set already exists.',
        })
      }

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

      const priceSet = await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ priceSets, prices }) => {
          const [priceSet] = await tx
            .insert(priceSets)
            .values({
              priceListId,
              productVariantId,
            })
            .returning()

          if (!priceSet) {
            throw new BadRequestError({
              code: 'PRICE_SET_NOT_CREATED',
              message: 'Price set not created.',
            })
          }

          await tx.insert(prices).values(
            pricesData.map((price) => ({
              priceSetId: priceSet.id,
              currencyCode: price.currencyCode,
              amount: price.amount,
            })),
          )

          return priceSet
        }),
      )

      return reply.status(201).send({
        priceSetId: priceSet.id,
      })
    },
  )
}
