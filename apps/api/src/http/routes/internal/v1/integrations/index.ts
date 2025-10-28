import { apiKeyAuthenticator } from '@/http/middlewares/internal/api-key-auth'
import type { FastifyTypedInstance } from '@/types/fastify'
import { status } from './status'

export async function integrationsRoutes(app: FastifyTypedInstance) {
  app.register(apiKeyAuthenticator) // Apply API key authentication middleware

  app.register(status)
}
