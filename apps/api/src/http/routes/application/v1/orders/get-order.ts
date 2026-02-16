import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { currencyCodeEnum } from '@/utils/schemas'
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
                paymentMethod: z
                  .object({
                    id: z.string(),
                    code: z.string(),
                    name: z.string(),
                    active: z.boolean(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
                paymentTerm: z
                  .object({
                    id: z.string(),
                    code: z.string(),
                    name: z.string(),
                    active: z.boolean(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
                carrier: z
                  .object({
                    id: z.string(),
                    code: z.string(),
                    name: z.string(),
                    active: z.boolean(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  })
                  .nullable(),
                status: z.string(),
                currencyCode: currencyCodeEnum,
                notes: z.string().nullable(),
                orderItems: z.array(
                  z.object({
                    id: z.string(),
                    referenceId: z.string().nullable(),
                    quantity: z.number(),
                    unitPrice: z.number(),
                    compareAtUnitPrice: z.number().nullable(),
                    notes: z.string().nullable(),
                    orderLineItem: z
                      .object({
                        id: z.string(),
                        productVariantId: z.string().nullable(),
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

      const { orderId } = request.params

      const order = await tenant.queries.orders.getOrderWithRelations({
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
