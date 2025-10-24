import type { FastifyTypedInstance } from '@/types/fastify'
import { getProfile } from './profile/get-profile'

export async function internalv1Routes(app: FastifyTypedInstance) {
  app.register(getProfile)
}
