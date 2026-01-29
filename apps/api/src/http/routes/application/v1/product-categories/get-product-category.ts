import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function getProductCategory(app: FastifyTypedInstance) {
  app.get(
    '/product-categories/:productCategoryId',
    {
      schema: {
        tags: ['Product Categories'],
        summary: 'Get product category details',
        operationId: 'getProductCategory',
        params: z.object({
          productCategoryId: z.string(),
        }),
        response: withDefaultErrorResponses({
          200: z
            .object({
              productCategory: z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
      const { tenant } = request.application

      const { productCategoryId } = request.params

      const productCategory =
        await tenant.queries.productCategories.getProductCategory({
          tenant: tenant.name,
          productCategoryId,
        })

      if (!productCategory) {
        throw new BadRequestError({
          code: 'PRODUCT_CATEGORY_NOT_FOUND',
          message: 'Product category not found.',
        })
      }

      return { productCategory }
    },
  )
}
