import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { auth, fromNodeHeaders } from '@workspace/auth'
import { fastifyPlugin } from 'fastify-plugin'

export const authenticator = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const authSession = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      })

      if (!authSession) {
        throw new UnauthorizedError()
      }

      request.platform = authSession
    })
  },
)
