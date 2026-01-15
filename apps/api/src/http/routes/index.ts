import type { FastifyTypedInstance } from '@/types/fastify'
import { applicationRoutes } from './application'
import { health } from './health'
import { platformRoutes } from './platform'

export async function routes(app: FastifyTypedInstance) {
  app.register(health)

  app.register(platformRoutes)

  app.register(applicationRoutes, { prefix: '/application' })
}
