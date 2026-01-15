import 'fastify'
import type { TenantContext } from '@/http/functions/tenant-resolver'
import type { auth } from '@workspace/auth'

declare module 'fastify' {
  export interface FastifyRequest {
    platform: typeof auth.$Infer.Session

    application: {
      tenant: TenantContext

      user: {
        id: string
        name: string
        username: string
        createdAt: Date
        updatedAt: Date
      }
    }
  }
}
