import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function createPaymentMethod(app: FastifyTypedInstance) {
  app.post(
    '/payment-methods',
    {
      schema: {
        tags: ['Payment Methods'],
        summary: 'Create a new payment method',
        operationId: 'createPaymentMethod',
        body: z.object({
          code: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          active: z.boolean().optional().default(true),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              paymentMethodId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { code, name, description, active } = request.body

      // Check if payment method with same code already exists
      const existingPaymentMethod = await tenant.schema(
        ({ paymentMethods }) =>
          tenant.db.query.paymentMethods.findFirst({
            where: orm.eq(paymentMethods.code, code),
          }),
      )

      if (existingPaymentMethod) {
        throw new BadRequestError({
          code: 'PAYMENT_METHOD_CODE_ALREADY_EXISTS',
          message: 'Payment method code already exists.',
        })
      }

      const [paymentMethod] = await tenant.schema(({ paymentMethods }) =>
        tenant.db
          .insert(paymentMethods)
          .values({
            code,
            name,
            description,
            active,
          })
          .returning(),
      )

      if (!paymentMethod) {
        throw new BadRequestError({
          code: 'PAYMENT_METHOD_NOT_CREATED',
          message: 'Payment method not created.',
        })
      }

      return reply.status(201).send({
        paymentMethodId: paymentMethod.id,
      })
    },
  )
}
