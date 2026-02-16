import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { documentTypeEnum, genderEnum } from '@/utils/schemas'
import { queries } from '@workspace/db/tenant/queries'
import { z } from 'zod'

const { FILTER_BY, SORT_BY, ORDER } = queries.customers.listCustomers

export async function listCustomers(app: FastifyTypedInstance) {
  app.get(
    '/customers',
    {
      schema: {
        tags: ['Customers'],
        description: 'Get all customers',
        operationId: 'listCustomers',
        querystring: z.object({
          search: z.string().optional(),
          filterBy: z.enum(FILTER_BY).optional().default('name'),
          sortBy: z.enum(SORT_BY).optional().default('createdAt'),
          order: z.enum(ORDER).optional().default('asc'),
          page: z.coerce.number().positive().optional().default(1),
          pageSize: z.coerce
            .number()
            .positive()
            .min(10)
            .max(100)
            .optional()
            .default(50),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              meta: z.object({
                search: z.string().optional(),
                filterBy: z.enum(FILTER_BY),
                sortBy: z.enum(SORT_BY),
                order: z.enum(ORDER),
                count: z.number(),
                page: z.number(),
                pageSize: z.number(),
              }),
              customers: z.array(
                z.object({
                  id: z.string(),
                  referenceId: z.string().nullable(),
                  name: z.string(),
                  documentType: documentTypeEnum.nullable(),
                  document: z.string().nullable(),
                  corporateName: z.string().nullable(),
                  stateRegistration: z.string().nullable(),
                  birthDate: z.date().nullable(),
                  gender: genderEnum.nullable(),
                  email: z.string().nullable(),
                  phone: z.string().nullable(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                }),
              ),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, customers } = await tenant.queries.customers.listCustomers(
        { tenant: tenant.name },
        { search, filterBy, sortBy, order, page, pageSize },
      )

      return {
        meta: {
          search,
          filterBy,
          sortBy,
          order,
          count,
          page,
          pageSize,
        },
        customers,
      }
    },
  )
}
