import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function deleteProduct(app: FastifyTypedInstance) {
  app.delete(
    '/products/:productId',
    {
      schema: {
        tags: ['Products'],
        summary: 'Delete a product',
        operationId: 'deleteProduct',
        params: z.object({
          productId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
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

      await tenant.schema(({ products }) =>
        tenant.db.delete(products).where(orm.eq(products.id, productId)),
      )

      return reply.status(204).send()
    },
  )
}
