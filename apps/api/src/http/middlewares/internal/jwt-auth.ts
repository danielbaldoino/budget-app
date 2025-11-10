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

      try {
        const userId = (await request.jwtVerify<{ sub: string }>()).sub

        const user = await request.internal.tenantSchema(({ users }) =>
          request.internal.tenantDb.query.users.findFirst({
            columns: { passwordHash: false },
            where: orm.eq(users.id, userId),
          }),
        )

        if (!user) {
          throw new UnauthorizedError({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          })
        }

        request.internal.authUser = user
      } catch {
        throw new UnauthorizedError({
          code: 'INVALID_JWT_TOKEN',
          message: 'Invalid JWT token',
        })
      }
    })
  },
)
