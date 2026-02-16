import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deletePaymentTerm(app: FastifyTypedInstance) {
  app.delete(
    '/payment-terms/:paymentTermId',
    {
      schema: {
        tags: ['Payment Terms'],
        summary: 'Delete a payment term',
        operationId: 'deletePaymentTerm',
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

      await tenant.schema(({ paymentTerms }) =>
        tenant.db
          .delete(paymentTerms)
          .where(orm.eq(paymentTerms.id, paymentTermId)),
      )

      return reply.status(204).send()
    },
  )
}
