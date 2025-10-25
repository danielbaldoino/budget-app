import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { fastifyPlugin } from 'fastify-plugin'

export const apiKeyAuthenticator = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const token = request.headers['x-api-key']

      if (!token || typeof token !== 'string') {
        throw new UnauthorizedError()
      }

      const [apiKey] = await request.internal.tenantSchema(({ apiKeys }) =>
        db.select().from(apiKeys).where(eq(apiKeys.token, token)).limit(1),
      )

      if (!apiKey) {
        throw new UnauthorizedError()
      }
    })
  },
)
