import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateProductOption(app: FastifyTypedInstance) {
  app.patch(
    '/products/:productId/options/:productOptionId',
    {
      schema: {
        tags: ['Product Options'],
        summary: 'Update a product option',
        operationId: 'updateProductOption',
        body: z.object({
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
        params: z.object({
          productId: z.string(),
          productOptionId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { productId, productOptionId } = request.params

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

      const productOption =
        await tenant.queries.products.options.getProductOptionWithRelations({
          tenant: tenant.name,
          productId,
          productOptionId,
        })

      if (!productOption) {
        throw new BadRequestError({
          code: 'OPTION_NOT_FOUND',
          message: 'Option not found.',
        })
      }

      const { name, values } = request.body

      const duplicatedOptionValue = findDuplicate(
        values,
        (optionValue) => optionValue.name,
      )

      if (duplicatedOptionValue) {
        throw new BadRequestError({
          code: 'OPTION_VALUE_DUPLICATED',
          message: `Option has value "${duplicatedOptionValue.name}" that is duplicated.`,
        })
      }

      const productOptionByName =
        await tenant.queries.products.options.getProductOptionByName({
          tenant: tenant.name,
          productId,
          name,
          not: {
            productOptionId,
          },
        })

      if (productOptionByName) {
        throw new BadRequestError({
          code: 'OPTION_NAME_ALREADY_EXISTS',
          message: 'Option name already exists.',
        })
      }

      await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ productOptions, productOptionValues }) => {
          await tx
            .update(productOptions)
            .set({ name })
            .where(orm.eq(productOptions.id, productOptionId))

          if (values) {
            const valuesToDelete = productOption.values.filter(
              (value) => !values.some((v) => v.name === value.name),
            )

            await tx.delete(productOptionValues).where(
              orm.inArray(
                productOptionValues.id,
                valuesToDelete.map((value) => value.id),
              ),
            )

            const valuesToCreate = values.filter(
              (value) =>
                !productOption.values.some((v) => v.name === value.name),
            )

            await tx.insert(productOptionValues).values(
              valuesToCreate.map((value) => ({
                optionId: productOptionId,
                name: value.name,
              })),
            )
          }
        }),
      )

      return reply.status(204).send()
    },
  )
}
