import type { FastifyTypedInstance } from '@/types/fastify'
import { authRoutes } from './core/auth-routes'
import { createApiKey } from './core/owned-workspace/api-keys/create-api-key'
import { deleteApiKey } from './core/owned-workspace/api-keys/delete-api-key'
import { getApiKey } from './core/owned-workspace/api-keys/get-api-key'
import { listApiKeys } from './core/owned-workspace/api-keys/list-api-keys'
import { updateApiKey } from './core/owned-workspace/api-keys/update-api-key'
import { createOwnedWorkspace } from './core/owned-workspace/create-workspace'
import { getOwnedWorkspace } from './core/owned-workspace/get-workspace'
import { updateOwnedWorkspace } from './core/owned-workspace/update-workspace'
import { createUser } from './core/owned-workspace/users/create-user'
import { deleteUser } from './core/owned-workspace/users/delete-user'
import { getUser } from './core/owned-workspace/users/get-user'
import { listUsers } from './core/owned-workspace/users/list-users'
import { updateUser } from './core/owned-workspace/users/update-user'
import { getProfile } from './core/profile/get-profile'
import { health } from './health'
import { internalRoutes } from './internal'

export async function routes(app: FastifyTypedInstance) {
  app.register(health)

  app.register(authRoutes, { prefix: '/auth' })

  app.register(getProfile)

  app.register(getOwnedWorkspace)
  app.register(createOwnedWorkspace)
  app.register(updateOwnedWorkspace)

  app.register(listApiKeys)
  app.register(createApiKey)
  app.register(getApiKey)
  app.register(updateApiKey)
  app.register(deleteApiKey)

  app.register(listUsers)
  app.register(createUser)
  app.register(getUser)
  app.register(updateUser)
  app.register(deleteUser)

  app.register(internalRoutes, { prefix: '/internal' })
}
