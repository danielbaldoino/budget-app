import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { tenantSchemas } from '@workspace/db/schema'
import { type SQL, experimental_tenantSchemaDb } from '@workspace/db/tenant'
import { fastifyPlugin } from 'fastify-plugin'

export const tenantDatabase = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const tenant = request.headers['x-tenant']

      if (!tenant || typeof tenant !== 'string') {
        throw new UnauthorizedError({
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        })
      }

      const [tSchmea] = await db
        .select({
          schemaName: tenantSchemas.schemaName,
        })
        .from(tenantSchemas)
        .where(eq(tenantSchemas.id, tenant))

      if (!tSchmea) {
        throw new UnauthorizedError({
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        })
      }

      request.internal.tenantDb = <T extends SQL>(qb: T) =>
        experimental_tenantSchemaDb<T>(tSchmea.schemaName, qb)
    })
  },
)
