import type { sdk } from '@/lib/sdk'

export type Customer = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.listCustomers>>['data']
>['customers'][number]
