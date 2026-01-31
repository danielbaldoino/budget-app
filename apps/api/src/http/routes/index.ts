import type { FastifyTypedInstance } from '@/types/fastify'
import { applicationRoutes } from './application'
import { authRoutes } from './auth-routes'
import { health } from './health'
import { platformRoutes } from './platform'

export async function routes(app: FastifyTypedInstance) {
  app.register(health)

  app.register(authRoutes, { prefix: '/auth' })

  app.register(platformRoutes)

  app.register(applicationRoutes, { prefix: '/application' })
}
