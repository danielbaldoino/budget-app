import 'fastify'
import type { auth } from '@workspace/auth'
import type { TenantDatabase, TenantSchemaCallback } from '@workspace/db/tenant'

declare module 'fastify' {
  export interface FastifyRequest {
    authSession: typeof auth.$Infer.Session

    internal: {
      tenant: string
      tenantSchema: <T>(cb: TenantSchemaCallback<T>) => T | Promise<T>
      tenantDb: TenantDatabase

      authUser: {
        id: string
        name: string
        username: string
        createdAt: Date
        updatedAt: Date
      }
    }
  }
}
