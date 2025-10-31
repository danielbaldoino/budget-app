import type { sdk } from '@/lib/sdk'

export type ApiKey = NonNullable<
  Awaited<ReturnType<typeof sdk.listApiKeys>>['data']
>['apiKeys'][number]
