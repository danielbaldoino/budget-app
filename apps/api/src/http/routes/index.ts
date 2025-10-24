import type { FastifyTypedInstance } from '@/types/fastify'
import { authRoutes } from './core/auth-routes'
import { createOwnedWorkspace } from './core/owned-workspace/create-workspace'
import { getOwnedWorkspace } from './core/owned-workspace/get-workspace'
import { updateOwnedWorkspace } from './core/owned-workspace/update-workspace'
import { getProfile } from './core/profile/get-profile'
import { health } from './health'
import { internalRoutes } from './internal'

export async function routes(app: FastifyTypedInstance) {
  app.register(health)

  app.register(getProfile)

  app.register(getOwnedWorkspace)
  app.register(createOwnedWorkspace)
  app.register(updateOwnedWorkspace)

  app.register(authRoutes, { prefix: '/auth' })
  app.register(internalRoutes, { prefix: '/internal' })
}
