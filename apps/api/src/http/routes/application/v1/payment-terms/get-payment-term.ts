import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { paymentTermRulesSchema } from '@/utils/schemas'
import { z } from 'zod'

export async function getPaymentTerm(app: FastifyTypedInstance) {
  app.get(
    '/payment-terms/:paymentTermId',
    {
      schema: {
        tags: ['Payment Terms'],
        summary: 'Get payment term details',
        operationId: 'getPaymentTerm',
        params: z.object({
          paymentTermId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              paymentTerm: z.object({
                id: z.string(),
                code: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                rules: paymentTermRulesSchema.nullish(),
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

      return { paymentTerm }
    },
  )
}
