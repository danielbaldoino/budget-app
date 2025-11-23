import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

export async function getProductOption(app: FastifyTypedInstance) {
  app.get(
    '/products/:productId/options/:productOptionId',
    {
      schema: {
        tags: ['Product Options'],
        summary: 'Get product option details',
        operationId: 'getProductOption',
        params: z.object({
          productId: z.string(),
          productOptionId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              productOption: z.object({
                id: z.string(),
                name: z.string(),
                values: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    createdAt: z.coerce.date(),
                    updatedAt: z.coerce.date(),
                  }),
                ),
                productId: z.string(),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { productId, productOptionId } = request.params

      const { tenant } = request.internal

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

      const productOption =
        await queries.tenant.products.options.getProductOptionWithRelations({
          tenant,
          productId,
          productOptionId,
        })

      if (!productOption) {
        throw new BadRequestError({
          code: 'OPTION_NOT_FOUND',
          message: 'Option not found.',
        })
      }

      return { productOption }
    },
  )
}
