import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetCartParams = {
  tenant: string
  cartId: string
}

export async function getCart(params: GetCartParams) {
  return tenantSchema(params.tenant, async ({ carts }) => {
    const cart = await tenantDb(params.tenant).query.carts.findFirst({
      where: eq(carts.id, params.cartId),
    })

    return cart || null
  })
}

type GetCartWithRelationsParams = {
  tenant: string
  cartId: string
}

export async function getCartWithRelations(params: GetCartWithRelationsParams) {
  return tenantSchema(params.tenant, async ({ carts }) => {
    const cart = await tenantDb(params.tenant).query.carts.findFirst({
      where: eq(carts.id, params.cartId),
      with: {
        seller: true,
        customer: true,
        cartItems: {
          with: {
            productVariant: true,
          },
        },
      },
    })

    return cart || null
  })
}
