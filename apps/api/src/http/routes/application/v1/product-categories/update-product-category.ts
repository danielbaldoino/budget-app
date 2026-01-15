import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function updateProductCategory(app: FastifyTypedInstance) {
  app.patch(
    '/product-categories/:productCategoryId',
    {
      schema: {
        tags: ['Product Categories'],
        summary: 'Update a product category',
        operationId: 'updateProductCategory',
        body: z.object({
          name: z.string(),
          description: z.string().nullish(),
        }),
        params: z.object({
          productCategoryId: z.string(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
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

      const { name, description } = request.body

      const productCategoryByName =
        await tenant.queries.productCategories.getProductCategoryByName({
          tenant: tenant.name,
          name,
          not: { productCategoryId },
        })

      if (productCategoryByName) {
        throw new BadRequestError({
          code: 'PRODUCT_CATEGORY_NAME_ALREADY_EXISTS',
          message: 'Product category name already exists.',
        })
      }

      await tenant.schema(({ productCategories }) =>
        tenant.db
          .update(productCategories)
          .set({
            name,
            description,
          })
          .where(orm.eq(productCategories.id, productCategoryId)),
      )

      return reply.status(204).send()
    },
  )
}
