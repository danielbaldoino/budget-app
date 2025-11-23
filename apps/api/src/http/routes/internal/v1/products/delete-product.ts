import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { queries } from '@workspace/db/queries'
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
          slug: z.string(),
          productId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
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

      await tenantSchema(({ products }) =>
        tenantDb.delete(products).where(orm.eq(products.id, productId)),
      )

      return reply.status(204).send()
    },
  )
}
