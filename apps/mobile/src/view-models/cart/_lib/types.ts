import type { sdk } from '@/lib/sdk'

export type CartItem = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.getCart>>['data']
>['cart']['cartItems'][number]
