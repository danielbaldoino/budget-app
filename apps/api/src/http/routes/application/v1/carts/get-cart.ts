import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { currencyCodeEnum, priceAdjustmentSchema } from '@/utils/schemas'
import { z } from 'zod'

export async function getCart(app: FastifyTypedInstance) {
  app.get(
    '/carts/:cartId',
    {
      schema: {
        tags: ['Carts'],
        summary: 'Get cart details',
        operationId: 'getCart',
        params: z.object({
          cartId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              cart: z.object({
                id: z.string(),
                name: z.string(),
                currencyCode: currencyCodeEnum,
                notes: z.string().nullable(),
                priceAdjustment: priceAdjustmentSchema.nullable(),
                seller: z
                  .object({
                    id: z.string(),
                    referenceId: z.string().nullable(),
                    name: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
                customer: z
                  .object({
                    id: z.string(),
                    referenceId: z.string().nullable(),
                    name: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
                priceList: z
                  .object({
                    id: z.string(),
                    name: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
                cartItems: z.array(
                  z.object({
                    id: z.string(),
                    quantity: z.number(),
                    notes: z.string().nullable(),
                    priceAdjustment: priceAdjustmentSchema.nullable(),
                    productVariant: z.object({
                      id: z.string(),
                      name: z.string(),
                      sku: z.string().nullable(),
                      manageInventory: z.boolean(),
                      thumbnail: z.string().url().nullable(),
                      createdAt: z.date(),
                      updatedAt: z.date(),
                    }),
                    priceList: z
                      .object({
                        id: z.string(),
                        name: z.string(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      })
                      .nullable(),
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

      const { cartId } = request.params

      const cart = await tenant.queries.carts.getCartWithRelations({
        tenant: tenant.name,
        cartId,
      })

      if (!cart) {
        throw new BadRequestError({
          code: 'CART_NOT_FOUND',
          message: 'Cart not found.',
        })
      }

      return { cart }
    },
  )
}
