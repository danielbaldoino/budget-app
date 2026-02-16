import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { documentTypeEnum, genderEnum } from '@/utils/schemas'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateCustomer(app: FastifyTypedInstance) {
  app.patch(
    '/customers/:customerId',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Update a customer',
        operationId: 'updateCustomer',
        body: z.object({
          referenceId: z.string().nullish(),
          name: z.string(),
          documentType: documentTypeEnum.nullable(),
          document: z.string().nullish(),
          corporateName: z.string().nullish(),
          stateRegistration: z.string().nullish(),
          birthDate: z.coerce.date().nullish(),
          gender: genderEnum.nullable(),
          email: z.string().email().nullish(),
          phone: z.string().nullish(),
        }),
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

      const {
        referenceId,
        name,
        documentType,
        document,
        corporateName,
        stateRegistration,
        birthDate,
        gender,
        email,
        phone,
      } = request.body

      tenant.schema(
        async ({ customers }) =>
          await tenant.db
            .update(customers)
            .set({
              referenceId,
              name,
              documentType,
              document,
              corporateName,
              stateRegistration,
              birthDate,
              gender,
              email,
              phone,
            })
            .where(orm.eq(customers.id, customerId)),
      )

      return reply.status(204).send()
    },
  )
}
