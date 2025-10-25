import type { FastifyTypedInstance } from '@/types/fastify'
import { internalv1Routes } from './v1'

export async function internalRoutes(app: FastifyTypedInstance) {
  app.register(internalv1Routes, { prefix: '/v1' }) // first version
}
