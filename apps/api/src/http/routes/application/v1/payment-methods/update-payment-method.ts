import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updatePaymentMethod(app: FastifyTypedInstance) {
  app.patch(
    '/payment-methods/:paymentMethodId',
    {
      schema: {
        tags: ['Payment Methods'],
        summary: 'Update a payment method',
        operationId: 'updatePaymentMethod',
        body: z.object({
          code: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          active: z.boolean(),
        }),
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

      const { code, name, description, active } = request.body

      // Check if another payment method with same code already exists
      const existingPaymentMethod = await tenant.schema(
        ({ paymentMethods }) =>
          tenant.db.query.paymentMethods.findFirst({
            where: orm.and(
              orm.eq(paymentMethods.code, code),
              orm.ne(paymentMethods.id, paymentMethodId),
            ),
          }),
      )

      if (existingPaymentMethod) {
        throw new BadRequestError({
          code: 'PAYMENT_METHOD_CODE_ALREADY_EXISTS',
          message: 'Payment method code already exists.',
        })
      }

      await tenant.schema(({ paymentMethods }) =>
        tenant.db
          .update(paymentMethods)
          .set({
            code,
            name,
            description,
            active,
          })
          .where(orm.eq(paymentMethods.id, paymentMethodId)),
      )

      return reply.status(204).send()
    },
  )
}
