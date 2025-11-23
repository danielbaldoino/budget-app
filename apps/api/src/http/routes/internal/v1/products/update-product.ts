import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { ProductStatus } from '@workspace/db/enums'
import { queries } from '@workspace/db/queries'
import { z } from 'zod'

export async function updateProduct(app: FastifyTypedInstance) {
  app.patch(
    '/products/:productId',
    {
      schema: {
        tags: ['Products'],
        summary: 'Update a product',
        operationId: 'updateProduct',
        body: z.object({
          name: z.string(),
          subtitle: z.string().nullish(),
          description: z.string().nullish(),
          status: z.enum(ProductStatus),
          thumbnailUrl: z.string().url().nullish(),
          images: z
            .array(
              z.object({
                url: z.string().url(),
                rank: z.number().int().nonnegative(),
              }),
            )
            .max(20)
            .nullish(),
          categoryId: z.string().nullish(),
          detail: z
            .object({
              purchaseCurrencyCode: z.string().nullish(),
              purchaseAmount: z.number().nonnegative().nullish(),
              brand: z.string().nullish(),
              material: z.string().nullish(),
            })
            .nullish(),
        }),
        params: z.object({
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

      const {
        name,
        subtitle,
        description,
        status,
        thumbnailUrl,
        images,
        categoryId,
        detail,
      } = request.body

      if (categoryId) {
        const category =
          await queries.tenant.productCategories.getProductCategory({
            tenant,
            productCategoryId: categoryId,
          })

        if (!category) {
          throw new BadRequestError({
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found.',
          })
        }
      }

      await tenantDb.transaction(async (tx) =>
        tenantSchema(async ({ products, productImages, productDetails }) => {
          await tx
            .update(products)
            .set({
              name,
              subtitle,
              description,
              status,
              thumbnailUrl,
              categoryId,
            })
            .where(orm.eq(products.id, productId))

          if (images) {
            await tx
              .delete(productImages)
              .where(orm.eq(productImages.productId, productId))

            await tx.insert(productImages).values(
              images
                .sort((a, b) => a.rank - b.rank)
                .map((image, index) => ({
                  productId,
                  url: image.url,
                  rank: index,
                })),
            )
          }

          if (detail) {
            const productDetail =
              await queries.tenant.products.details.getProductDetail({
                tenant,
                productId,
              })

            if (productDetail) {
              await tx
                .update(productDetails)
                .set({
                  purchaseCurrencyCode: detail.purchaseCurrencyCode,
                  purchaseAmount: detail.purchaseAmount,
                  brand: detail.brand,
                  material: detail.material,
                })
                .where(orm.eq(productDetails.id, productDetail.id))
            } else {
              await tx.insert(productDetails).values({
                productId,
                purchaseCurrencyCode: detail.purchaseCurrencyCode,
                purchaseAmount: detail.purchaseAmount,
                brand: detail.brand,
                material: detail.material,
              })
            }
          }
        }),
      )

      return reply.status(204).send()
    },
  )
}
