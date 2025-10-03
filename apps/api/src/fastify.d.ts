import 'fastify'
import type { auth } from '@workspace/auth'
import type { SQL } from '@workspace/db/tenant'

declare module 'fastify' {
  export interface FastifyRequest {
    authSession: typeof auth.$Infer.Session

    internal: {
      tenantDb: <T extends SQL>(qb: T) => Promise<T>

      authUser: {
        id: string
        name: string
        username: string
        password: string
        createdAt: Date
        updatedAt: Date
      }
    }
  }
}
