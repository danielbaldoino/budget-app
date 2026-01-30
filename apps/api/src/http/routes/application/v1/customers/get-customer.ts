import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { AddressType, DocumentType, Gender } from '@workspace/db/tenant/enums'
import { z } from 'zod'

export async function getCustomer(app: FastifyTypedInstance) {
  app.get(
    '/customers/:customerId',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Get customer details',
        operationId: 'getCustomer',
        params: z.object({
          customerId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              customer: z.object({
                id: z.string(),
                referenceId: z.string().nullable(),
                name: z.string(),
                documentType: z.enum(DocumentType).nullable(),
                document: z.string().nullable(),
                corporateName: z.string().nullable(),
                stateRegistration: z.string().nullable(),
                birthDate: z.date().nullable(),
                gender: z.enum(Gender).nullable(),
                email: z.string().nullable(),
                phone: z.string().nullable(),
                addresses: z.array(
                  z.object({
                    id: z.string(),
                    type: z.enum(AddressType).nullable(),
                    street: z.string().nullable(),
                    number: z.string().nullable(),
                    complement: z.string().nullable(),
                    neighborhood: z.string().nullable(),
                    city: z.string().nullable(),
                    state: z.string().nullable(),
                    country: z.string().nullable(),
                    zipCode: z.string().nullable(),
                    reference: z.string().nullable(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  }),
                ),
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

      const { customerId } = request.params

      const customer = await tenant.queries.customers.getCustomerWithRelations({
        tenant: tenant.name,
        customerId,
      })

      if (!customer) {
        throw new BadRequestError({
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found.',
        })
      }

      return { customer }
    },
  )
}
