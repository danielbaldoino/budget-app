import 'fastify'
import type { auth } from '@workspace/auth'
import type { TenantTables } from '@workspace/db/tenant'

declare module 'fastify' {
  export interface FastifyRequest {
    authSession: typeof auth.$Infer.Session

    internal: {
      // Function to run queries against the tenant-specific database
      tenantSchema: <T>(
        callback: (tables: TenantTables) => T | Promise<T>,
      ) => T | Promise<T>

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
