import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { fastifyPlugin } from 'fastify-plugin'

export const jwtAuthenticator = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      if (!request.headers.authorization) {
        throw new UnauthorizedError({
          code: 'MISSING_JWT_TOKEN',
          message: 'Missing JWT token in authorization header',
        })
      }

      const { tenant } = request.application

      try {
        const { sub: userId } = await request.jwtVerify<{ sub: string }>()

        const userRelations = await tenant.schema(({ users }) =>
          tenant.db.query.users.findFirst({
            columns: { passwordHash: false },
            where: orm.eq(users.id, userId),
            with: {
              seller: true,
            },
          }),
        )

        if (!userRelations) {
          throw Error('User not found')
        }

        if (!userRelations.seller) {
          throw Error('Seller not found for user')
        }

        const { seller, ...user } = userRelations

        request.application.user = {
          ...user,
          sellerId: seller.id,
          name: seller.name,
        }
      } catch {
        throw new UnauthorizedError({
          code: 'INVALID_JWT_TOKEN',
          message: 'Invalid JWT token',
        })
      }
    })
  },
)
