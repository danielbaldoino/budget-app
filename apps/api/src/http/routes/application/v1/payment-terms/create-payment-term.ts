import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { paymentTermRulesSchema } from '@/utils/schemas'
import { orm } from '@workspace/db'
import type { PaymentTermRules } from '@workspace/db/tenant/types'
import { z } from 'zod'

export async function createPaymentTerm(app: FastifyTypedInstance) {
  app.post(
    '/payment-terms',
    {
      schema: {
        tags: ['Payment Terms'],
        summary: 'Create a new payment term',
        operationId: 'createPaymentTerm',
        body: z.object({
          code: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          rules: paymentTermRulesSchema.nullish(),
          active: z.boolean().optional().default(true),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              paymentTermId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { code, name, description, rules, active } = request.body

      // Check if payment term with same code already exists
      const existingPaymentTerm = await tenant.schema(({ paymentTerms }) =>
        tenant.db.query.paymentTerms.findFirst({
          where: orm.eq(paymentTerms.code, code),
        }),
      )

      if (existingPaymentTerm) {
        throw new BadRequestError({
          code: 'PAYMENT_TERM_CODE_ALREADY_EXISTS',
          message: 'Payment term code already exists.',
        })
      }

      const [paymentTerm] = await tenant.schema(({ paymentTerms }) =>
        tenant.db
          .insert(paymentTerms)
          .values({
            code,
            name,
            description,
            rules: rules as PaymentTermRules | null | undefined,
            active,
          })
          .returning(),
      )

      if (!paymentTerm) {
        throw new BadRequestError({
          code: 'PAYMENT_TERM_NOT_CREATED',
          message: 'Payment term not created.',
        })
      }

      return reply.status(201).send({
        paymentTermId: paymentTerm.id,
      })
    },
  )
}
