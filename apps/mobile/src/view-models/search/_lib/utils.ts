import type { sdk } from '@/lib/sdk'

export type Product = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.listProducts>>['data']
>['products'][number]
