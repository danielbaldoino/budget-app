import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { z } from 'zod'

export async function createProductCategory(app: FastifyTypedInstance) {
  app.post(
    '/product-categories',
    {
      schema: {
        tags: ['Product Categories'],
        summary: 'Create a new product category',
        operationId: 'createProductCategory',
        body: z.object({
          name: z.string(),
          description: z.string().nullish(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              productCategoryId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { name, description } = request.body

      const productCategoryByName =
        await tenant.queries.productCategories.getProductCategoryByName({
          tenant: tenant.name,
          name,
        })

      if (productCategoryByName) {
        throw new BadRequestError({
          code: 'PRODUCT_CATEGORY_NAME_EXISTS',
          message: 'Product category with this name already exists',
        })
      }

      const [productCategory] = await tenant.schema(({ productCategories }) =>
        tenant.db
          .insert(productCategories)
          .values({
            name,
            description,
          })
          .returning(),
      )

      if (!productCategory) {
        throw new BadRequestError({
          code: 'PRODUCT_CATEGORY_NOT_CREATED',
          message: 'Product category could not be created',
        })
      }

      return reply.status(201).send({
        productCategoryId: productCategory.id,
      })
    },
  )
}
