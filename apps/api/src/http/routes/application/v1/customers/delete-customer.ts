import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteCustomer(app: FastifyTypedInstance) {
  app.delete(
    '/customers/:customerId',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Delete a customer',
        operationId: 'deleteCustomer',
        params: z.object({
          customerId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { customerId } = request.params

      const customer = await tenant.queries.customers.getCustomer({
        tenant: tenant.name,
        customerId,
      })

      if (!customer) {
        throw new BadRequestError({
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found.',
        })
      }

      await tenant.schema(({ customers }) =>
        tenant.db.delete(customers).where(orm.eq(customers.id, customerId)),
      )

      return reply.status(204).send()
    },
  )
}
