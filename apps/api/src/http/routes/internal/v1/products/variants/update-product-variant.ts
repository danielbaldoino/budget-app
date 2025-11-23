import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { orm } from '@workspace/db'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

export async function updateProductVariant(app: FastifyTypedInstance) {
  app.patch(
    '/products/:productId/variants/:productVariantId',
    {
      schema: {
        tags: ['Product Variants'],
        summary: 'Update a product variant',
        operationId: 'updateProductVariant',
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
          productVariantId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { productId, productVariantId } = request.params

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

      const productVariant =
        await queries.tenant.products.variants.getProductVariant({
          tenant,
          productId,
          productVariantId,
        })

      if (!productVariant) {
        throw new BadRequestError({
          code: 'VARIANT_NOT_FOUND',
          message: 'Variant not found.',
        })
      }

      const { name, sku, manageInventory, thumbnail, images, options, amount } =
        request.body

      const productVariantByName =
        await queries.tenant.products.variants.getProductVariantByName({
          tenant,
          productId,
          name,
          not: {
            productVariantId,
          },
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
            not: {
              productVariantId,
            },
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

      const productVariantByProduct =
        await queries.tenant.products.variants.listProductVariantsWithOptions({
          tenant,
          productId,
          productVariantId,
        })

      const variantByOptionValues = productVariantByProduct.find((variant) => {
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

      await tenantDb.transaction(async (tx) =>
        tenantSchema(
          async ({
            productVariants,
            productImages,
            productOptionValuesToProductVariants,
            priceSets,
            prices,
            inventoryItems,
          }) => {
            const [updatedProductVariant] = await tx
              .update(productVariants)
              .set({
                name,
                sku,
                manageInventory,
                thumbnail,
              })
              .where(orm.eq(productVariants.id, productVariantId))
              .returning()

            if (!updatedProductVariant) {
              throw new BadRequestError({
                code: 'VARIANT_NOT_UPDATED',
                message: 'Variant not updated.',
              })
            }

            await tx
              .delete(productOptionValuesToProductVariants)
              .where(
                orm.eq(
                  productOptionValuesToProductVariants.variantId,
                  productVariantId,
                ),
              )

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
                  variantId: productVariantId,
                  optionValueId: productOptionValue!.id,
                }
              }),
            )

            if (images) {
              await tx
                .delete(productImages)
                .where(orm.eq(productImages.variantId, productVariantId))

              await tx.insert(productImages).values(
                images
                  .sort((a, b) => a.rank - b.rank)
                  .map((image, index) => ({
                    variantId: productVariantId,
                    url: image.url,
                    rank: index,
                  })),
              )
            }

            const priceSet =
              await queries.tenant.priceSets.getPriceSetByProductVariantId({
                tenant,
                productVariantId,
              })

            if (priceSet) {
              const [price] = await queries.tenant.priceSets.prices.listPrices({
                tenant,
                priceSetId: priceSet.id,
              })

              if (price) {
                await tx
                  .update(prices)
                  .set({
                    currencyCode: 'brl',
                    amount,
                  })
                  .where(orm.eq(prices.id, price.id))
              } else {
                await tx.insert(prices).values({
                  priceSetId: priceSet.id,
                  currencyCode: 'brl',
                  amount,
                })
              }
            } else {
              const [createdPriceSet] = await tx
                .insert(priceSets)
                .values({
                  productVariantId,
                })
                .returning()

              if (!createdPriceSet) {
                throw new BadRequestError({
                  code: 'PRICE_SET_NOT_CREATED',
                  message: 'Price set not created.',
                })
              }

              await tx.insert(prices).values({
                priceSetId: createdPriceSet.id,
                currencyCode: 'brl',
                amount,
              })
            }

            if (!productVariant.manageInventory && manageInventory) {
              await tx.insert(inventoryItems).values({
                variantId: productVariantId,
              })
            }

            if (productVariant.manageInventory && manageInventory === false) {
              await tx
                .delete(inventoryItems)
                .where(orm.eq(inventoryItems.variantId, productVariantId))
            }
          },
        ),
      )

      return reply.status(204).send()
    },
  )
}
