import { and, eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../../tenant'

type GetCartItemParams = {
  tenant: string
  cartId: string
  cartItemId: string
}

export async function getCartItem(params: GetCartItemParams) {
  return tenantSchema(params.tenant, async ({ cartItems }) => {
    const cartItem = await tenantDb(params.tenant).query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, params.cartId),
        eq(cartItems.id, params.cartItemId),
      ),
    })

    return cartItem || null
  })
}

type GetCartItemByProductVariantIdParams = {
  tenant: string
  cartId: string
  productVariantId: string
}

export async function getCartItemByProductVariantId(
  params: GetCartItemByProductVariantIdParams,
) {
  return tenantSchema(params.tenant, async ({ cartItems }) => {
    const cartItem = await tenantDb(params.tenant).query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, params.cartId),
        eq(cartItems.productVariantId, params.productVariantId),
      ),
    })

    return cartItem || null
  })
}
