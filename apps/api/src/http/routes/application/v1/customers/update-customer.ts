import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { AddressType, DocumentType, Gender } from '@workspace/db/tenant/enums'
import { z } from 'zod'

const AddressSchema = z.object({
  id: z.string().optional(),
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
        addresses,
      } = request.body

      await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ customers, addresses: addressesTable }) => {
          // Update customer basic info
          await tx
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
            .where(orm.eq(customers.id, customerId))

          // Handle addresses if provided
          if (addresses) {
            // Delete existing addresses not in the update
            const addressIdsToKeep = addresses
              .filter((a) => a.id)
              .map((a) => a.id!)

            await tx
              .delete(addressesTable)
              .where(
                orm.and(
                  orm.eq(addressesTable.customerId, customerId),
                  addressIdsToKeep.length > 0
                    ? orm.notInArray(addressesTable.id, addressIdsToKeep)
                    : undefined,
                ),
              )

            // Update or insert addresses
            for (const address of addresses) {
              if (address.id) {
                // Update existing address
                await tx
                  .update(addressesTable)
                  .set({
                    type: address.type,
                    street: address.street,
                    number: address.number,
                    complement: address.complement,
                    neighborhood: address.neighborhood,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    zipCode: address.zipCode,
                    reference: address.reference,
                  })
                  .where(
                    orm.and(
                      orm.eq(addressesTable.id, address.id),
                      orm.eq(addressesTable.customerId, customerId),
                    ),
                  )
              } else {
                // Insert new address
                await tx.insert(addressesTable).values({
                  type: address.type,
                  street: address.street,
                  number: address.number,
                  complement: address.complement,
                  neighborhood: address.neighborhood,
                  city: address.city,
                  state: address.state,
                  country: address.country,
                  zipCode: address.zipCode,
                  reference: address.reference,
                  customerId,
                })
              }
            }
          }
        }),
      )

      return reply.status(204).send()
    },
  )
}
