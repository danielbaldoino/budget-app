import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

export async function createProductVariant(app: FastifyTypedInstance) {
  app.post(
    '/products/:productId/variants',
    {
      schema: {
        tags: ['Product Variants'],
        summary: 'Create a new product variant',
        operationId: 'createProductVariant',
        body: z.object({
          name: z.string(),
          sku: z.string().nullish(),
          manageInventory: z.boolean().optional(),
          thumbnail: z.string().url().nullish(),
          images: z
            .array(
              z.object({
                url: z.string().url(),
                rank: z.number().int().nonnegative(),
              }),
            )
            .max(20)
            .nullish(),
          options: z.array(
            z.object({
              name: z.string(),
              value: z.string(),
            }),
          ),
          amount: z.number().nonnegative(),
        }),
        params: z.object({
          productId: z.string(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              productVariantId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { productId } = request.params

      const { tenant, tenantSchema, tenantDb } = request.internal

      const product = await queries.tenant.products.getProduct({
        tenant,
        productId,
      })

      if (!product) {
        throw new BadRequestError({
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.',
        })
      }

      const { name, sku, manageInventory, thumbnail, images, options, amount } =
        request.body

      const productVariantByName =
        await queries.tenant.products.variants.getProductVariantByName({
          tenant,
          productId,
          name,
        })

      if (productVariantByName) {
        throw new BadRequestError({
          code: 'VARIANT_NAME_ALREADY_EXISTS',
          message: 'Variant name already exists.',
        })
      }

      if (sku) {
        const productVariantBySku =
          await queries.tenant.products.variants.getProductVariantBySku({
            tenant,
            productId,
            sku,
          })

        if (productVariantBySku) {
          throw new BadRequestError({
            code: 'VARIANT_SKU_ALREADY_EXISTS',
            message: 'Variant SKU already exists.',
          })
        }
      }

      const duplicatedOption = findDuplicate(
        options,
        (variantOption) => variantOption.name,
      )

      if (duplicatedOption) {
        throw new BadRequestError({
          code: 'VARIANT_OPTION_DUPLICATED',
          message: `Variant has option "${duplicatedOption.name}" that is duplicated.`,
        })
      }

      const productOptions =
        await queries.tenant.products.options.listProductOptionsWithValues({
          tenant,
          productId,
        })

      if (productOptions.length !== options.length) {
        throw new BadRequestError({
          code: 'VARIANT_OPTION_COUNT_MISMATCH',
          message:
            'Variant must have the same number of options as the product.',
        })
      }

      for (const option of options) {
        const productOption = productOptions.find(
          (productOption) => productOption.name === option.name,
        )

        if (!productOption) {
          throw new BadRequestError({
            code: 'VARIANT_OPTION_NOT_FOUND',
            message: `Variant has option "${option.name}" that is not found in product options.`,
          })
        }

        const productOptionValue = productOption.values.find(
          (productOptionValue) => productOptionValue.name === option.value,
        )

        if (!productOptionValue) {
          throw new BadRequestError({
            code: 'VARIANT_OPTION_VALUE_NOT_FOUND',
            message: `Variant has option "${option.name}" with value "${option.value}" that is not found in product options.`,
          })
        }
      }

      const productVariantsByProduct =
        await queries.tenant.products.variants.listProductVariantsWithOptions({
          tenant,
          productId,
        })

      const variantByOptionValues = productVariantsByProduct.find((variant) => {
        const variantOptions = variant.options.map((optionValue) => ({
          name: optionValue.optionValue!.option!.name,
          value: optionValue.optionValue!.name,
        }))

        return (
          variantOptions.length === options.length &&
          variantOptions.every((variantOption) =>
            options.some(
              (option) =>
                option.name === variantOption.name &&
                option.value === variantOption.value,
            ),
          )
        )
      })

      if (variantByOptionValues) {
        throw new BadRequestError({
          code: 'VARIANT_WITH_SAME_OPTIONS_ALREADY_EXISTS',
          message: 'Variant with the same options already exists.',
        })
      }

      const productVariant = await tenantDb.transaction(async (tx) =>
        tenantSchema(
          async ({
            productVariants,
            productImages,
            productOptionValuesToProductVariants,
            priceSets,
            prices,
            inventoryItems,
          }) => {
            const [productVariant] = await tx
              .insert(productVariants)
              .values({
                productId,
                name,
                sku,
                manageInventory,
                thumbnail,
              })
              .returning()

            if (!productVariant) {
              throw new BadRequestError({
                code: 'PRODUCT_VARIANT_NOT_CREATED',
                message: 'Product variant not created.',
              })
            }

            if (images) {
              await tx.insert(productImages).values(
                images
                  .sort((a, b) => a.rank - b.rank)
                  .map((image, index) => ({
                    variantId: productVariant.id,
                    url: image.url,
                    rank: index,
                  })),
              )
            }

            await tx.insert(productOptionValuesToProductVariants).values(
              options.map((option) => {
                const productOption = productOptions.find(
                  (productOption) => productOption.name === option.name,
                )
                const productOptionValue = productOption!.values.find(
                  (productOptionValue) =>
                    productOptionValue.name === option.value,
                )

                return {
                  variantId: productVariant.id,
                  optionValueId: productOptionValue!.id,
                }
              }),
            )

            const [priceSet] = await tx
              .insert(priceSets)
              .values({
                productVariantId: productVariant.id,
              })
              .returning()

            if (!priceSet) {
              throw new BadRequestError({
                code: 'PRICE_SET_NOT_CREATED',
                message: 'Price set not created.',
              })
            }

            await tx.insert(prices).values({
              priceSetId: priceSet.id,
              currencyCode: 'BRL',
              amount,
            })

            if (manageInventory) {
              await tx.insert(inventoryItems).values({
                variantId: productVariant.id,
              })
            }

            return productVariant
          },
        ),
      )

      return reply.status(201).send({
        productVariantId: productVariant.id,
      })
    },
  )
}
