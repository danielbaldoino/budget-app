import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { z } from 'zod'

export async function upsertCartItem(app: FastifyTypedInstance) {
  app.post(
    '/carts/:cartId/items',
    {
      schema: {
        tags: ['Carts'],
        summary: 'Create or update a cart item',
        operationId: 'upsertCartItem',
        body: z.object({
          productVariantId: z.string(),
          quantity: z.number().int().positive(),
          notes: z.string().nullish(),
          priceListId: z.string().nullish(),
          priceAdjustment: z
            .object({
              type: z.enum(['discount', 'surcharge']),
              mode: z.enum(['fixed', 'percentage']),
              value: z.number(),
              applyOn: z.enum(['unit', 'item-total']),
            })
            .nullish(),
        }),
        params: z.object({
          cartId: z.string(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              cartItemId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { tenant } = request.application

      const { cartId } = request.params

      const cart = await tenant.queries.carts.getCart({
        tenant: tenant.name,
        cartId,
      })

      if (!cart) {
        throw new BadRequestError({
          code: 'CART_NOT_FOUND',
          message: 'Cart not found.',
        })
      }

      const {
        productVariantId,
        quantity,
        notes,
        priceListId,
        priceAdjustment,
      } = request.body

      const productVariant =
        await tenant.queries.products.variants.getProductVariant({
          tenant: tenant.name,
          productVariantId,
        })

      if (!productVariant) {
        throw new BadRequestError({
          code: 'PRODUCT_VARIANT_NOT_FOUND',
          message: 'Product variant not found.',
        })
      }

      if (priceListId) {
        const priceList = await tenant.queries.priceLists.getPriceList({
          tenant: tenant.name,
          priceListId,
        })

        if (!priceList) {
          throw new BadRequestError({
            code: 'PRICE_LIST_NOT_FOUND',
            message: 'Price list not found.',
          })
        }
      }

      const cartItemByProductVariant =
        await tenant.queries.carts.items.getCartItemByProductVariantId({
          tenant: tenant.name,
          cartId,
          productVariantId,
        })

      const cartItem = await tenant.db.transaction(async (tx) =>
        tenant.schema(async ({ cartItems }) => {
          const _priceAdjustment = priceAdjustment
            ? {
                type: priceAdjustment.type,
                mode: priceAdjustment.mode,
                value: priceAdjustment.value,
                applyOn: priceAdjustment.applyOn,
              }
            : priceAdjustment

          if (cartItemByProductVariant) {
            const [updatedCartItem] = await tx
              .update(cartItems)
              .set({
                priceListId,
                quantity,
                notes,
                priceAdjustment: _priceAdjustment,
              })
              .where(orm.eq(cartItems.id, cartItemByProductVariant.id))
              .returning()

            if (!updatedCartItem) {
              throw new BadRequestError({
                code: 'CART_ITEM_NOT_UPDATED',
                message: 'Cart item not updated.',
              })
            }

            return updatedCartItem
          }

          const [cartItem] = await tx
            .insert(cartItems)
            .values({
              cartId,
              productVariantId,
              priceListId,
              quantity,
              notes,
              priceAdjustment: _priceAdjustment,
            })
            .returning()

          if (!cartItem) {
            throw new BadRequestError({
              code: 'CART_ITEM_NOT_CREATED',
              message: 'Cart item not created.',
            })
          }

          return cartItem
        }),
      )

      return reply.status(201).send({
        cartItemId: cartItem.id,
      })
    },
  )
}
