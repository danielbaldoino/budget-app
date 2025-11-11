import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { AddressType, DocumentType, Gender } from '@workspace/db/enums'
import { buildRelationManyQuery } from '@workspace/db/utils'
import { z } from 'zod'

const FILTER_BY = [
  'all',
  'referenceId',
  'name',
  'document',
  'addresses.street',
] as const
const SORT_BY = ['name', 'addresses.street', 'createdAt'] as const
const ORDER = ['asc', 'desc'] as const

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
                  documentType: z.enum(DocumentType).nullable(),
                  document: z.string().nullable(),
                  tradeName: z.string().nullable(),
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
              ),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenantSchema, tenantDb } = request.internal

      const { search, filterBy, sortBy, order, page, pageSize } = request.query

      const { count, customers } = await tenantSchema(
        async ({ customers, addresses }) => {
          const customerAddressesSubQuery = buildRelationManyQuery({
            as: 'addresses',
            table: addresses,
            where: orm.eq(addresses.customerId, customers.id),
          })

          const WHERE = () => {
            const searchCondition: orm.SQL[] = []

            if (search) {
              if (filterBy === 'all' || filterBy === 'name') {
                searchCondition.push(orm.ilike(customers.name, `%${search}%`))
              }

              if (filterBy === 'all' || filterBy === 'document') {
                searchCondition.push(
                  orm.ilike(customers.document, `%${search}%`),
                )
              }

              if (filterBy === 'all' || filterBy.includes('addresses.')) {
                const addressesSearchCondition: orm.SQL[] = []

                if (filterBy === 'all' || filterBy === 'addresses.street') {
                  addressesSearchCondition.push(
                    orm.ilike(addresses.street, `%${search}%`),
                  )
                }

                searchCondition.push(
                  orm.exists(
                    tenantDb
                      .select({ exists: orm.sql`1` })
                      .from(addresses)
                      .where(
                        orm.and(
                          orm.eq(addresses.customerId, customers.id),
                          ...addressesSearchCondition,
                        ),
                      ),
                  ),
                )
              }
            }

            return searchCondition.length
              ? orm.or(...searchCondition)
              : undefined
          }

          const ORDER_BY = () => {
            const orderFn = order === 'asc' ? orm.asc : orm.desc

            if (sortBy === 'name') {
              return orderFn(customers.name)
            }

            return orderFn(customers.createdAt)
          }

          const [count, listCustomers] = await Promise.all([
            tenantDb.$count(customers, WHERE()),

            tenantDb
              .select({
                ...orm.getTableColumns(customers),
                addresses: customerAddressesSubQuery.data,
              })
              .from(customers)
              .leftJoinLateral(customerAddressesSubQuery, orm.sql`true`)
              .where(WHERE())
              .orderBy(ORDER_BY())
              .offset((page - 1) * pageSize)
              .limit(pageSize),
          ])

          return {
            count,
            customers: listCustomers,
          }
        },
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
