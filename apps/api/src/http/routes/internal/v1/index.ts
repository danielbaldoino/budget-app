import { jwtAuthenticator } from '@/http/middlewares/internal/jwt-auth'
import { tenantDatabase } from '@/http/middlewares/internal/tenant-database'
import type { FastifyTypedInstance } from '@/types/fastify'
import { logIn } from './auth/login'
import { listCustomers } from './customers/list-cutomers'
import { integrationsRoutes } from './integrations'
import { getProfile } from './profile/get-profile'

async function routesWithAuth(app: FastifyTypedInstance) {
  app.register(jwtAuthenticator) // Apply JWT authentication middleware

  app.register(getProfile)

  app.register(listCustomers)
}

export async function internalv1Routes(app: FastifyTypedInstance) {
  app.register(tenantDatabase) // Apply tenant database middleware

  app.register(integrationsRoutes, { prefix: '/integrations' })

  app.register(logIn, { prefix: '/auth' })

  app.register(routesWithAuth)
}
