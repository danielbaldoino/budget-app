import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { AddressType, DocumentType, Gender } from '@workspace/db/tenant/enums'
import { z } from 'zod'

const AddressSchema = z.object({
  type: z.enum(AddressType).nullish(),
  street: z.string().nullish(),
  number: z.string().nullish(),
  complement: z.string().nullish(),
  neighborhood: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string().nullish(),
  zipCode: z.string().nullish(),
  reference: z.string().nullish(),
})

export async function createCustomer(app: FastifyTypedInstance) {
  app.post(
    '/customers',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Create a new customer',
        operationId: 'createCustomer',
        body: z.object({
          referenceId: z.string().nullish(),
          name: z.string(),
          documentType: z.enum(DocumentType).nullish(),
          document: z.string().nullish(),
          corporateName: z.string().nullish(),
          stateRegistration: z.string().nullish(),
          birthDate: z.coerce.date().nullish(),
          gender: z.enum(Gender).nullish(),
          email: z.string().email().nullish(),
          phone: z.string().nullish(),
          addresses: z.array(AddressSchema).optional(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              customerId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

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
        addresses,
      } = request.body

      const [customer] = await tenant.schema(({ customers }) =>
        tenant.db
          .insert(customers)
          .values({
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
          .returning(),
      )

      if (!customer) {
        throw new BadRequestError({
          code: 'CUSTOMER_NOT_CREATED',
          message: 'Customer not created.',
        })
      }

      // Create addresses if provided
      if (addresses && addresses.length > 0) {
        await tenant.schema(({ addresses: addressesTable }) =>
          tenant.db.insert(addressesTable).values(
            addresses.map((address) => ({
              ...address,
              customerId: customer.id,
            })),
          ),
        )
      }

      return reply.status(201).send({
        customerId: customer.id,
      })
    },
  )
}
