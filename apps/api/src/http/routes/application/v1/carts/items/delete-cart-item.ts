import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteCartItem(app: FastifyTypedInstance) {
  app.delete(
    '/carts/:cartId/items/:cartItemId',
    {
      schema: {
        tags: ['Carts'],
        summary: 'Delete a cart item',
        operationId: 'deleteCartItem',
        params: z.object({
          cartId: z.string(),
          cartItemId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { cartId, cartItemId } = request.params

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

      const cartItem = await tenant.queries.carts.items.getCartItem({
        tenant: tenant.name,
        cartId,
        cartItemId,
      })

      if (!cartItem) {
        throw new BadRequestError({
          code: 'CART_ITEM_NOT_FOUND',
          message: 'Cart item not found.',
        })
      }

      await tenant.schema(({ cartItems }) =>
        tenant.db.delete(cartItems).where(orm.eq(cartItems.id, cartItemId)),
      )

      return reply.status(204).send()
    },
  )
}
