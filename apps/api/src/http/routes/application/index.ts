import type { FastifyTypedInstance } from '@/types/fastify'
import { applicationV1Routes } from './v1'

export async function applicationRoutes(app: FastifyTypedInstance) {
  app.register(applicationV1Routes, { prefix: '/v1' }) // first version
}
