import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { ProductStatus } from '@workspace/db/tenant/enums'
import { z } from 'zod'

export async function createProduct(app: FastifyTypedInstance) {
  app.post(
    '/products',
    {
      schema: {
        tags: ['Products'],
        summary: 'Create a new product',
        operationId: 'createProduct',
        body: z.object({
          name: z.string(),
          subtitle: z.string().nullish(),
          description: z.string().nullish(),
          status: z.enum(ProductStatus),
          thumbnailUrl: z.string().url().nullish(),
          images: z
            .array(
              z.object({
                url: z.string().url(),
                rank: z.number().int().nonnegative(),
              }),
            )
            .max(20)
            .nullish(),
          categoryId: z.string().nullish(),
          options: z
            .array(
              z.object({
                name: z.string(),
                values: z
                  .array(
                    z.object({
                      name: z.string(),
                    }),
                  )
                  .min(1)
                  .max(100),
              }),
            )
            .min(1)
            .max(100),
          variants: z
            .array(
              z.object({
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
            )
            .min(1)
            .max(100),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              productId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const {
        name,
        subtitle,
        description,
        status,
        thumbnailUrl,
        images,
        categoryId,
        options,
        variants,
      } = request.body

      const duplicatedOption = findDuplicate(options, (option) => option.name)

      if (duplicatedOption) {
        throw new BadRequestError({
          code: 'OPTION_DUPLICATED',
          message: `Option "${duplicatedOption.name}" is duplicated.`,
        })
      }

      for (const option of options) {
        const duplicatedOptionValue = findDuplicate(
          option.values,
          (optionValue) => optionValue.name,
        )

        if (duplicatedOptionValue) {
          throw new BadRequestError({
            code: 'OPTION_VALUE_DUPLICATED',
            message: `Option "${option.name}" has value "${duplicatedOptionValue.name}" that is duplicated.`,
          })
        }
      }

      const duplicatedVariantByName = findDuplicate(
        variants,
        (variant) => variant.name,
      )

      if (duplicatedVariantByName) {
        throw new BadRequestError({
          code: 'VARIANT_NAME_DUPLICATED',
          message: `Variant "${duplicatedVariantByName.name}" is duplicated.`,
        })
      }

      const duplicatedVariantBySKU = findDuplicate(
        variants.filter((v) => Boolean(v.sku)),
        (variant) => variant.sku!,
      )

      if (duplicatedVariantBySKU) {
        throw new BadRequestError({
          code: 'VARIANT_SKU_DUPLICATED',
          message: `Variant SKU "${duplicatedVariantBySKU.sku}" is duplicated.`,
        })
      }

      for (const variant of variants) {
        const duplicatedOption = findDuplicate(
          variant.options,
          (variantOption) => variantOption.name,
        )

        if (duplicatedOption) {
          throw new BadRequestError({
            code: 'VARIANT_OPTION_DUPLICATED',
            message: `Variant "${variant.name}" has option "${duplicatedOption.name}" that is duplicated.`,
          })
        }

        if (options.length !== variant.options.length) {
          throw new BadRequestError({
            code: 'VARIANT_OPTION_COUNT_MISMATCH',
            message: `Variant "${variant.name}" must have the same number of options as the product.`,
          })
        }

        for (const option of variant.options) {
          const productOption = options.find(
            (productOption) => productOption.name === option.name,
          )

          if (!productOption) {
            throw new BadRequestError({
              code: 'VARIANT_OPTION_NOT_FOUND',
              message: `Variant "${variant.name}" has option "${option.name}" that is not found in product options.`,
            })
          }

          const productOptionValue = productOption.values.find(
            (productOptionValue) => productOptionValue.name === option.value,
          )

          if (!productOptionValue) {
            throw new BadRequestError({
              code: 'VARIANT_OPTION_VALUE_NOT_FOUND',
              message: `Variant "${variant.name}" has option "${option.name}" with value "${option.value}" that is not found in product options.`,
            })
          }
        }

        const duplicatedVariantOptionValues = variants.filter(
          (productVariant) =>
            productVariant.name !== variant.name &&
            productVariant.options.length === variant.options.length &&
            productVariant.options.every((variantOption) =>
              variant.options.some(
                (option) =>
                  option.name === variantOption.name &&
                  option.value === variantOption.value,
              ),
            ),
        )

        if (duplicatedVariantOptionValues.length) {
          const pluralOption = duplicatedVariantOptionValues.length > 1
          const pluralVariant = duplicatedVariantOptionValues.length > 1

          throw new BadRequestError({
            code: 'VARIANT_OPTION_VALUE_DUPLICATED',
            message: `Variant "${variant.name}" has option${pluralOption && 's'} ${variant.options
              .map((option) => `"${option.name}: ${option.value}"`)
              .join(
                ', ',
              )} that is duplicated with variant${pluralVariant && 's'} ${duplicatedVariantOptionValues
              .map((variant) => `"${variant.name}"`)
              .join(', ')}.`,
          })
        }
      }

      if (categoryId) {
        const category =
          await tenant.queries.productCategories.getProductCategory({
            tenant: tenant.name,
            productCategoryId: categoryId,
          })

        if (!category) {
          throw new BadRequestError({
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found.',
          })
        }
      }

      const product = await tenant.db.transaction(async (tx) =>
        tenant.schema(
          async ({
            products,
            productOptions,
            productOptionValues,
            productVariants,
            productImages,
            productOptionValuesToProductVariants,
            priceSets,
            prices,
            inventoryItems,
          }) => {
            const [product] = await tx
              .insert(products)
              .values({
                name,
                subtitle,
                description,
                status,
                thumbnailUrl,
                categoryId,
              })
              .returning()

            if (!product) {
              throw new BadRequestError({
                code: 'PRODUCT_NOT_CREATED',
                message: 'Product not created.',
              })
            }

            if (images) {
              await tx.insert(productImages).values(
                images
                  .sort((a, b) => a.rank - b.rank)
                  .map((image, index) => ({
                    productId: product.id,
                    url: image.url,
                    rank: index,
                  })),
              )
            }

            const productOptionsWithValues: (typeof productOptions.$inferSelect & {
              values: (typeof productOptionValues.$inferSelect)[]
            })[] = []

            await Promise.all(
              options.map(async (option) => {
                const [createdProductOption] = await tx
                  .insert(productOptions)
                  .values({
                    productId: product.id,
                    name: option.name,
                  })
                  .returning()

                if (!createdProductOption) {
                  throw new BadRequestError({
                    code: 'OPTION_NOT_CREATED',
                    message: 'Option not created.',
                  })
                }

                const createdProductOptionValues = await tx
                  .insert(productOptionValues)
                  .values(
                    option.values.map((value) => ({
                      optionId: createdProductOption.id,
                      name: value.name,
                    })),
                  )
                  .returning()

                productOptionsWithValues.push({
                  ...createdProductOption,
                  values: createdProductOptionValues,
                })
              }),
            )

            await Promise.all(
              variants.map(async (variant) => {
                const [createdVariant] = await tx
                  .insert(productVariants)
                  .values({
                    productId: product.id,
                    name: variant.name,
                    sku: variant.sku,
                    manageInventory: variant.manageInventory,
                    thumbnail: variant.thumbnail,
                  })
                  .returning()

                if (!createdVariant) {
                  throw new BadRequestError({
                    code: 'VARIANT_NOT_CREATED',
                    message: 'Variant not created.',
                  })
                }

                if (variant.images) {
                  await tx.insert(productImages).values(
                    variant.images
                      .sort((a, b) => a.rank - b.rank)
                      .map((image, index) => ({
                        variantId: createdVariant.id,
                        url: image.url,
                        rank: index,
                      })),
                  )
                }

                await tx.insert(productOptionValuesToProductVariants).values(
                  variant.options.map((option) => {
                    const productOption = productOptionsWithValues.find(
                      (productOption) => productOption.name === option.name,
                    )

                    const productOptionValue = productOption!.values.find(
                      (productOptionValue) =>
                        productOptionValue.name === option.value,
                    )

                    return {
                      variantId: createdVariant.id,
                      optionValueId: productOptionValue!.id,
                    }
                  }),
                )

                const [priceSet] = await tx
                  .insert(priceSets)
                  .values({
                    productVariantId: createdVariant.id,
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
                  amount: variant.amount,
                })

                if (variant.manageInventory) {
                  await tx.insert(inventoryItems).values({
                    variantId: createdVariant.id,
                  })
                }
              }),
            )

            return product
          },
        ),
      )

      return reply.status(201).send({
        productId: product.id,
      })
    },
  )
}
