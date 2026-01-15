import { tenantContext } from '@/http/middlewares/application/tenant-context'
import type { FastifyTypedInstance } from '@/types/fastify'
import { logIn } from './auth/login'
import { integrationsRoutes } from './integrations'
import { routesWithAuth } from './routes-with-auth'

export async function applicationV1Routes(app: FastifyTypedInstance) {
  app.register(tenantContext) // Apply tenant context middleware

  app.register(integrationsRoutes, { prefix: '/integrations' })

  app.register(logIn, { prefix: '/auth' })

  app.register(routesWithAuth)
}
