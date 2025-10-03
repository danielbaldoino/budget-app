import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { users } from '@workspace/db/tenant/schema'
import { fastifyPlugin } from 'fastify-plugin'

export const tenantAuthenticate = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      if (!request.headers.authorization) {
        throw new UnauthorizedError()
      }

      try {
        const userId = (await request.jwtVerify<{ sub: string }>()).sub

        const [user] = await request.internal.tenantDb(
          db
            .select({
              id: users.id,
              name: users.name,
              username: users.username,
              password: users.password,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, userId)),
        )

        if (!user) {
          throw new UnauthorizedError()
        }

        request.internal.authUser = user
      } catch {
        throw new UnauthorizedError()
      }
    })
  },
)
