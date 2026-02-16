import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { paymentTermRulesSchema } from '@/utils/schemas'
import { orm } from '@workspace/db'
import type { PaymentTermRules } from '@workspace/db/tenant/types'
import { z } from 'zod'

export async function updatePaymentTerm(app: FastifyTypedInstance) {
  app.patch(
    '/payment-terms/:paymentTermId',
    {
      schema: {
        tags: ['Payment Terms'],
        summary: 'Update a payment term',
        operationId: 'updatePaymentTerm',
        body: z.object({
          code: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          rules: paymentTermRulesSchema.nullish(),
          active: z.boolean(),
        }),
        params: z.object({
          paymentTermId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { paymentTermId } = request.params

      const paymentTerm = await tenant.queries.paymentTerms.getPaymentTerm({
        tenant: tenant.name,
        paymentTermId,
      })

      if (!paymentTerm) {
        throw new BadRequestError({
          code: 'PAYMENT_TERM_NOT_FOUND',
          message: 'Payment term not found.',
        })
      }

      const { code, name, description, rules, active } = request.body

      // Check if another payment term with same code already exists
      const existingPaymentTerm = await tenant.schema(({ paymentTerms }) =>
        tenant.db.query.paymentTerms.findFirst({
          where: orm.and(
            orm.eq(paymentTerms.code, code),
            orm.ne(paymentTerms.id, paymentTermId),
          ),
        }),
      )

      if (existingPaymentTerm) {
        throw new BadRequestError({
          code: 'PAYMENT_TERM_CODE_ALREADY_EXISTS',
          message: 'Payment term code already exists.',
        })
      }

      await tenant.schema(({ paymentTerms }) =>
        tenant.db
          .update(paymentTerms)
          .set({
            code,
            name,
            description,
            rules: rules as PaymentTermRules | null | undefined,
            active,
          })
          .where(orm.eq(paymentTerms.id, paymentTermId)),
      )

      return reply.status(204).send()
    },
  )
}
