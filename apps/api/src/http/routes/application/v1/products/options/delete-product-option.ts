import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteProductOption(app: FastifyTypedInstance) {
  app.delete(
    '/products/:productId/options/:productOptionId',
    {
      schema: {
        tags: ['Product Options'],
        summary: 'Delete a product option',
        operationId: 'deleteProductOption',
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
        await tenant.queries.products.options.getProductOption({
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

      await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ productOptions }) => {
          await tx
            .delete(productOptions)
            .where(orm.eq(productOptions.id, productOptionId))
        }),
      )

      return reply.status(204).send()
    },
  )
}
