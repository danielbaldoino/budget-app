import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { findDuplicate } from '@/utils/find-duplicate'
import { z } from 'zod'

export async function createProductOption(app: FastifyTypedInstance) {
  app.post(
    '/products/:productId/options',
    {
      schema: {
        tags: ['Product Options'],
        summary: 'Create a new product option',
        operationId: 'createProductOption',
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
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              productOptionId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { productId } = request.params

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
        })

      if (productOptionByName) {
        throw new BadRequestError({
          code: 'OPTION_NAME_ALREADY_EXISTS',
          message: 'Option name already exists.',
        })
      }

      const productOption = await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ productOptions, productOptionValues }) => {
          const [productOption] = await tx
            .insert(productOptions)
            .values({
              productId,
              name,
            })
            .returning()

          if (!productOption) {
            throw new BadRequestError({
              code: 'OPTION_NOT_CREATED',
              message: 'Option not created.',
            })
          }

          await tx.insert(productOptionValues).values(
            values.map((value) => ({
              optionId: productOption.id,
              name: value.name,
            })),
          )

          return productOption
        }),
      )

      return reply.status(201).send({
        productOptionId: productOption.id,
      })
    },
  )
}
