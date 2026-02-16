import type { sdk } from '@/lib/sdk'

export type Product = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.getProduct>>['data']
>['product']

export type ProductVariant = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.getProductVariant>>['data']
>['productVariant']

export type ProductVariantPrice = NonNullable<
  Awaited<ReturnType<typeof sdk.v1.getProductVariant>>['data']
>['productVariant']['priceSets'][number]['prices'][number]
