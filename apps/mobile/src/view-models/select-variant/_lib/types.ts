import type { sdk } from '@/lib/sdk'

export type Variant = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.listProductVariants>>['data']
>['productVariants'][number]
