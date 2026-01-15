import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteProductVariant(app: FastifyTypedInstance) {
  app.delete(
    '/products/:productId/variants/:productVariantId',
    {
      schema: {
        tags: ['Product Variants'],
        summary: 'Delete a product variant',
        operationId: 'deleteProductVariant',
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

      await tenant.schema(({ productVariants }) =>
        tenant.db
          .delete(productVariants)
          .where(orm.eq(productVariants.id, productVariantId)),
      )

      return reply.status(204).send()
    },
  )
}
