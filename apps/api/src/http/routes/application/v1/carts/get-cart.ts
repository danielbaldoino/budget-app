import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
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

      return { cart }
    },
  )
}
