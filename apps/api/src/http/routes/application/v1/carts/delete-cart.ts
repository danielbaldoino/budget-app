import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteCart(app: FastifyTypedInstance) {
  app.delete(
    '/carts/:cartId',
    {
      schema: {
        tags: ['Carts'],
        summary: 'Delete a cart',
        operationId: 'deleteCart',
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

      await tenant.schema(({ carts }) =>
        tenant.db.delete(carts).where(orm.eq(carts.id, cartId)),
      )

      return reply.status(204).send()
    },
  )
}
