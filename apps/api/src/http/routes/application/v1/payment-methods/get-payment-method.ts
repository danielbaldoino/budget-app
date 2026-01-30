import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getPaymentMethod(app: FastifyTypedInstance) {
  app.get(
    '/payment-methods/:paymentMethodId',
    {
      schema: {
        tags: ['Payment Methods'],
        summary: 'Get payment method details',
        operationId: 'getPaymentMethod',
        params: z.object({
          paymentMethodId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              paymentMethod: z.object({
                id: z.string(),
                code: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                active: z.boolean(),
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

      const { paymentMethodId } = request.params

      const paymentMethod =
        await tenant.queries.paymentMethods.getPaymentMethod({
          tenant: tenant.name,
          paymentMethodId,
        })

      if (!paymentMethod) {
        throw new BadRequestError({
          code: 'PAYMENT_METHOD_NOT_FOUND',
          message: 'Payment method not found.',
        })
      }

      return { paymentMethod }
    },
  )
}
