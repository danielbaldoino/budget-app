import { eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../../../db'
import { buildRelationManyQuery } from '../../../lib/utils'
import { tenantSchema } from '../../../tenant'

type GetCustomerParams = {
  tenant: string
  customerId: string
}

export async function getCustomer(params: GetCustomerParams) {
  return tenantSchema(params.tenant, async ({ customers }) => {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, params.customerId))
      .limit(1)

    return customer || null
  })
}

type GetCustomerWithRelationsParams = {
  tenant: string
  customerId: string
}

export async function getCustomerWithRelations(
  params: GetCustomerWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ customers, addresses }) => {
    const addressesSubQuery = buildRelationManyQuery({
      as: 'addresses',
      table: addresses,
      where: eq(addresses.customerId, customers.id),
    })

    const [customer] = await db
      .select({
        ...getTableColumns(customers),
        addresses: addressesSubQuery.data,
      })
      .from(customers)
      .leftJoinLateral(addressesSubQuery, sql`true`)
      .where(eq(customers.id, params.customerId))
      .limit(1)

    return customer || null
  })
}
