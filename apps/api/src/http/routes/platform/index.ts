import { authenticator } from '@/http/middlewares/platform/authenticator'
import type { FastifyTypedInstance } from '@/types/fastify'
import { createApiKey } from './api-keys/create-api-key'
import { deleteApiKey } from './api-keys/delete-api-key'
import { getApiKey } from './api-keys/get-api-key'
import { listApiKeys } from './api-keys/list-api-keys'
import { updateApiKey } from './api-keys/update-api-key'
import { createOwnedWorkspace } from './owned-workspace/create-workspace'
import { getOwnedWorkspace } from './owned-workspace/get-workspace'
import { updateOwnedWorkspace } from './owned-workspace/update-workspace'
import { getProfile } from './profile/get-profile'
import { createUser } from './users/create-user'
import { deleteUser } from './users/delete-user'
import { getUser } from './users/get-user'
import { listUsers } from './users/list-users'
import { updateUser } from './users/update-user'

export async function platformRoutes(app: FastifyTypedInstance) {
  app.register(authenticator) // Apply authentication middleware

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
}
