import type { sdk } from '@/lib/sdk'

export type User = NonNullable<
  Awaited<ReturnType<typeof sdk.listUsers>>['data']
>['users'][number]
