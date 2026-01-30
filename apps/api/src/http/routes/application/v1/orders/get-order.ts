import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getOrder(app: FastifyTypedInstance) {
  app.get(
    '/orders/:orderId',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Get order details',
        operationId: 'getOrder',
        params: z.object({
          orderId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              order: z.object({
                id: z.string(),
                referenceId: z.string().nullable(),
                displayId: z.number(),

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

      const { orderId } = request.params

      const order = await tenant.queries.orders.getOrder({
        tenant: tenant.name,
        orderId,
      })

      if (!order) {
        throw new BadRequestError({
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found.',
        })
      }

      return { order }
    },
  )
}
