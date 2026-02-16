import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { orm } from '@workspace/db'
import { fastifyPlugin } from 'fastify-plugin'

const API_KEY_HEADER = 'x-api-key'

export const apiKeyAuthenticator = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const token = request.headers[API_KEY_HEADER]

      if (!token || typeof token !== 'string') {
        throw new UnauthorizedError({
          code: 'MISSING_API_KEY',
          message: `Missing API key in header ${API_KEY_HEADER}`,
        })
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
