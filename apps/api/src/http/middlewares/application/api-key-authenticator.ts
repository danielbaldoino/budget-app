import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { fastifyPlugin } from 'fastify-plugin'

export const apiKeyAuthenticator = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const token = request.headers['x-api-key']

      if (!token || typeof token !== 'string') {
        throw new UnauthorizedError()
      }

      const { tenant } = request.application

      const apiKey = await tenant.schema(({ apiKeys }) =>
        tenant.db.query.apiKeys.findFirst({
          where: orm.eq(apiKeys.token, token),
        }),
      )

      if (!apiKey) {
        throw new UnauthorizedError({
          code: 'INVALID_API_KEY',
          message: 'Invalid API key',
        })
      }
    })
  },
)
