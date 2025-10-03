import type { FastifyTypedInstance } from '@/types/fastify'
import { authRoutes } from './auth-routes'
import { health } from './health'
import { internalRoutes } from './internal'
import { createOwnedWorkspace } from './owned-workspace/create-workspace'
import { getOwnedWorkspace } from './owned-workspace/get-workspace'
import { updateOwnedWorkspace } from './owned-workspace/update-workspace'
import { getProfile } from './profile/get-profile'

export async function routes(app: FastifyTypedInstance) {
  app.register(health)
  app.register(authRoutes, { prefix: '/auth' })
  app.register(internalRoutes, { prefix: '/internal' })

  app.register(getProfile)

  app.register(getOwnedWorkspace)
  app.register(createOwnedWorkspace)
  app.register(updateOwnedWorkspace)
}
