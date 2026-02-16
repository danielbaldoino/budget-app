import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { currencyCodeEnum } from '@/utils/schemas'
import { orm } from '@workspace/db'
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
            .optional(),
          options: z.array(
            z.object({
              name: z.string(),
              value: z.string(),
            }),
          ),
          prices: z
            .array(
              z.object({
                currencyCode: currencyCodeEnum,
                amount: z.number().nonnegative(),
              }),
            )
            .optional(),
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
      const { tenant } = request.application

      const { productId, productVariantId } = request.params

      const product = await tenant.queries.products.getProduct({
        tenant: tenant.name,
        productId,
      })

      if (!product) {
        throw new BadRequestError({
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.',
        })
      }

      const productVariant =
        await tenant.queries.products.variants.getProductVariant({
          tenant: tenant.name,
          productId,
          productVariantId,
        })

      if (!productVariant) {
        throw new BadRequestError({
          code: 'VARIANT_NOT_FOUND',
          message: 'Variant not found.',
        })
      }

      const {
        name,
        sku,
        manageInventory,
        thumbnail,
        images,
        options,
        prices: pricesData,
      } = request.body

      const productVariantByName =
        await tenant.queries.products.variants.getProductVariantByName({
          tenant: tenant.name,
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
          await tenant.queries.products.variants.getProductVariantBySku({
            tenant: tenant.name,
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
        await tenant.queries.products.options.listProductOptionsWithValues({
          tenant: tenant.name,
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
        await tenant.queries.products.variants.listProductVariantsWithOptions({
          tenant: tenant.name,
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

      await tenant.db.transaction(async (tx) =>
        tenant.schema(
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

            if (pricesData) {
              const duplicatedPrice = findDuplicate(
                pricesData,
                (price) => price.currencyCode,
              )

              if (duplicatedPrice) {
                throw new BadRequestError({
                  code: 'PRICE_DUPLICATED',
                  message: `Price has currency code "${duplicatedPrice.currencyCode}" that is duplicated.`,
                })
              }

              const priceSet =
                await tenant.queries.priceSets.getPriceSetByProductVariantId({
                  tenant: tenant.name,
                  productVariantId,
                })

              if (priceSet) {
                await tx
                  .delete(prices)
                  .where(orm.eq(prices.priceSetId, priceSet.id))

                await tx.insert(prices).values(
                  pricesData.map((price) => ({
                    priceSetId: priceSet.id,
                    currencyCode: price.currencyCode,
                    amount: price.amount,
                  })),
                )
              } else {
                const [createdPriceSet] = await tx
                  .insert(priceSets)
                  .values({
                    productVariantId: productVariant.id,
                  })
                  .returning()

                if (!createdPriceSet) {
                  throw new BadRequestError({
                    code: 'PRICE_SET_NOT_CREATED',
                    message: 'Price set not created.',
                  })
                }

                await tx.insert(prices).values(
                  pricesData.map((price) => ({
                    priceSetId: createdPriceSet.id,
                    currencyCode: price.currencyCode,
                    amount: price.amount,
                  })),
                )
              }
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
