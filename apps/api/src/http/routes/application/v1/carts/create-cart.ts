import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { CurrencyCode } from '@workspace/db/tenant/enums'
import { z } from 'zod'

export async function createCart(app: FastifyTypedInstance) {
  app.post(
    '/carts',
    {
      schema: {
        tags: ['Carts'],
        summary: 'Create a new cart',
        operationId: 'createCart',
        body: z.object({
          name: z.string(),
          currencyCode: z.enum(CurrencyCode),
          notes: z.string().nullish(),
          priceAdjustment: z
            .object({
              type: z.enum(['discount', 'surcharge']),
              mode: z.enum(['fixed', 'percentage']),
              value: z.number(),
            })
            .nullish(),
          customerId: z.string().nullish(),
          priceListId: z.string().nullish(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              cartId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant, user } = request.application

      const {
        name,
        currencyCode,
        notes,
        priceAdjustment,
        customerId,
        priceListId,
      } = request.body

      if (customerId) {
        const customer = await tenant.queries.customers.getCustomer({
          tenant: tenant.name,
          customerId,
        })

        if (!customer) {
          throw new BadRequestError({
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Customer not found.',
          })
        }
      }

      if (priceListId) {
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
      }

      const [cart] = await tenant.schema(({ carts }) =>
        tenant.db
          .insert(carts)
          .values({
            sellerId: user.sellerId,
            customerId,
            priceListId,
            name,
            currencyCode,
            notes,
            priceAdjustment: priceAdjustment
              ? {
                  type: priceAdjustment.type,
                  mode: priceAdjustment.mode,
                  value: priceAdjustment.value,
                  applyOn: 'cart-total' as const,
                }
              : priceAdjustment,
          })
          .returning(),
      )

      if (!cart) {
        throw new BadRequestError({
          code: 'CART_NOT_CREATED',
          message: 'Cart not created.',
        })
      }

      return reply.status(201).send({
        cartId: cart.id,
      })
    },
  )
}
