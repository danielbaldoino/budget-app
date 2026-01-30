import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetOrderParams = {
  tenant: string
  orderId: string
}

export async function getOrder(params: GetOrderParams) {
  return tenantSchema(params.tenant, async ({ orders }) => {
    const order = await tenantDb(params.tenant).query.orders.findFirst({
      where: eq(orders.id, params.orderId),
    })

    return order || null
  })
}

type GetOrderWithRelationsParams = {
  tenant: string
  orderId: string
}

export async function getOrderWithRelations(
  params: GetOrderWithRelationsParams,
) {
  return tenantSchema(params.tenant, async ({ orders }) => {
    const order = await tenantDb(params.tenant).query.orders.findFirst({
      where: eq(orders.id, params.orderId),
      with: {
        seller: true,
        customer: true,
        details: true,
        addresses: true,
        orderItems: true,
      },
    })

    return order || null
  })
}
