import { apiKeyAuthenticator } from '@/http/middlewares/internal/api-key-auth'
import type { FastifyTypedInstance } from '@/types/fastify'

export async function integrationsRoutes(app: FastifyTypedInstance) {
  app.register(apiKeyAuthenticator) // Apply API key authentication middleware

  // Define integration-related routes here
}
