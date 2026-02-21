import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { cartPriceAdjustmentSchema, currencyCodeEnum } from '@/utils/schemas'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateCart(app: FastifyTypedInstance) {
  app.patch(
    '/carts/:cartId',
    {
      schema: {
        tags: ['Carts'],
        summary: 'Update a cart',
        operationId: 'updateCart',
        body: z.object({
          name: z.string().optional(),
          currencyCode: currencyCodeEnum.optional(),
          notes: z.string().nullish(),
          priceAdjustment: cartPriceAdjustmentSchema.nullish(),
          customerId: z.string().nullish(),
          priceListId: z.string().nullish(),
        }),
        params: z.object({
          cartId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { cartId } = request.params

      const cart = await tenant.queries.carts.getCart({
        tenant: tenant.name,
        cartId,
      })

      if (!cart) {
        throw new BadRequestError({
          code: 'CART_NOT_FOUND',
          message: 'Cart not found.',
        })
      }
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

      await tenant.schema(({ carts }) =>
        tenant.db
          .update(carts)
          .set({
            customerId,
            // priceListId,
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
          .where(orm.eq(carts.id, cartId)),
      )

      return reply.status(204).send()
    },
  )
}
