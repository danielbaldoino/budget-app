import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function createPriceList(app: FastifyTypedInstance) {
  app.post(
    '/price-lists',
    {
      schema: {
        tags: ['Price Lists'],
        summary: 'Create a new price list',
        operationId: 'createPriceList',
        body: z.object({
          name: z.string(),
          description: z.string().optional(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              priceListId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { name, description } = request.body

      const priceListByName =
        await tenant.queries.priceLists.getPriceListByName({
          tenant: tenant.name,
          name,
        })

      if (priceListByName) {
        throw new BadRequestError({
          code: 'PRICE_LIST_NAME_ALREADY_EXISTS',
          message: 'Price list name already exists.',
        })
      }

      const [priceList] = await tenant.schema(({ priceLists }) =>
        tenant.db
          .insert(priceLists)
          .values({
            name,
            description,
          })
          .returning(),
      )

      if (!priceList) {
        throw new BadRequestError({
          code: 'PRICE_LIST_NOT_CREATED',
          message: 'Price list not created.',
        })
      }

      return reply.status(201).send({
        priceListId: priceList.id,
      })
    },
  )
}
