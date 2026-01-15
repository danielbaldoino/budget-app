import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { fastifyPlugin } from 'fastify-plugin'

export const jwtAuthenticator = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      if (!request.headers.authorization) {
        throw new UnauthorizedError()
      }

      const { tenant } = request.application

      try {
        const { sub: userId } = await request.jwtVerify<{ sub: string }>()

        const user = await tenant.schema(({ users }) =>
          tenant.db.query.users.findFirst({
            columns: { passwordHash: false },
            where: orm.eq(users.id, userId),
          }),
        )

        if (!user) {
          throw Error('User not found')
        }

        request.application.user = user
      } catch {
        throw new UnauthorizedError({
          code: 'INVALID_JWT_TOKEN',
          message: 'Invalid JWT token',
        })
      }
    })
  },
)
