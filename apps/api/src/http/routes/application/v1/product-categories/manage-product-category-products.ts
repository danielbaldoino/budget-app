import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function manageProductCategoryProducts(app: FastifyTypedInstance) {
  app.patch(
    '/product-categories/:productCategoryId/products',
    {
      schema: {
        tags: ['Product Categories'],
        summary:
          'Manage products of a product category to add or remove them from the product category',
        operationId: 'manageProductCategoryProducts',
        body: z.object({
          add: z.array(z.string()).max(100),
          remove: z.array(z.string()).max(100),
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

      const { add, remove } = request.body

      const [productsAdd, productsRemove] = await Promise.all([
        tenant.queries.products.listProductsByIds({
          tenant: tenant.name,
          productIds: add,
        }),
        tenant.queries.products.listProductsByIds({
          tenant: tenant.name,
          productIds: remove,
        }),
      ])

      const productAddIdsNotFound = add.filter(
        (id) => !productsAdd.some((product) => product.id === id),
      )
      const productRemoveIdsNotFound = remove.filter(
        (id) => !productsRemove.some((product) => product.id === id),
      )

      if (productAddIdsNotFound.length || productRemoveIdsNotFound.length) {
        const productIdsNotFound = [
          ...productAddIdsNotFound,
          ...productRemoveIdsNotFound,
        ]

        const plural = productIdsNotFound.length > 1

        throw new BadRequestError({
          code: 'PRODUCTS_NOT_FOUND',
          message: `Product${plural && 's'} with ID${plural && 's'} ${productIdsNotFound.join(', ')} not found.`,
        })
      }

      await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ products }) => {
          await tx
            .update(products)
            .set({
              categoryId: productCategoryId,
            })
            .where(orm.inArray(products.id, add))

          await tx
            .update(products)
            .set({
              categoryId: null,
            })
            .where(
              orm.and(
                orm.eq(products.categoryId, productCategoryId),
                orm.inArray(products.id, remove),
              ),
            )
        }),
      )

      return reply.status(204).send()
    },
  )
}
