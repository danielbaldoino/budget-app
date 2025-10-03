import type { FastifyTypedInstance } from '@/types/fastify'
import { getProfile } from './profile/get-profile'

export async function internalRoutes(app: FastifyTypedInstance) {
  app.register(getProfile)
}
