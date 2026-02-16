import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deletePaymentMethod(app: FastifyTypedInstance) {
  app.delete(
    '/payment-methods/:paymentMethodId',
    {
      schema: {
        tags: ['Payment Methods'],
        summary: 'Delete a payment method',
        operationId: 'deletePaymentMethod',
        params: z.object({
          paymentMethodId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
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

      await tenant.schema(({ paymentMethods }) =>
        tenant.db
          .delete(paymentMethods)
          .where(orm.eq(paymentMethods.id, paymentMethodId)),
      )

      return reply.status(204).send()
    },
  )
}
