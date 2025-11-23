import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

export async function deleteProductCategory(app: FastifyTypedInstance) {
  app.delete(
    '/product-categories/:productCategoryId',
    {
      schema: {
        tags: ['Product Categories'],
        summary: 'Delete a product category',
        operationId: 'deleteProductCategory',
        params: z.object({
          productCategoryId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { productCategoryId } = request.params

      const { tenant, tenantSchema, tenantDb } = request.internal

      const productCategory =
        await queries.tenant.productCategories.getProductCategory({
          tenant,
          productCategoryId,
        })

      if (!productCategory) {
        throw new BadRequestError({
          code: 'PRODUCT_CATEGORY_NOT_FOUND',
          message: 'Product category not found.',
        })
      }

      await tenantSchema(({ productCategories }) =>
        tenantDb
          .delete(productCategories)
          .where(orm.eq(productCategories.id, productCategoryId)),
      )

      return reply.status(204).send()
    },
  )
}
