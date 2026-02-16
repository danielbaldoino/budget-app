import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetCustomerParams = {
  tenant: string
  customerId: string
}

export async function getCustomer(params: GetCustomerParams) {
  return tenantSchema(params.tenant, async ({ customers }) => {
    const customer = await tenantDb(params.tenant).query.customers.findFirst({
      where: eq(customers.id, params.customerId),
    })

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
  return tenantSchema(params.tenant, async ({ customers }) => {
    const customer = await tenantDb(params.tenant).query.customers.findFirst({
      where: eq(customers.id, params.customerId),
      with: {
        addresses: true,
      },
    })

    return customer || null
  })
}
