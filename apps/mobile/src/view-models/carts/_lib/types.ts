import type { sdk } from '@/lib/sdk'

export type Cart = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.listCarts>>['data']
>['carts'][number]
