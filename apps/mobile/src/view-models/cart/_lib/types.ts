import type { sdk } from '@/lib/sdk'

type Cart = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.getCart>>['data']
>['cart']

export type CartItem = Cart['cartItems'][number]

export type Customer = NonNullable<Cart['customer']>
