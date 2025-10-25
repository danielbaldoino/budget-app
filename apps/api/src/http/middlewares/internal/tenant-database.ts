import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { tenantSchemas } from '@workspace/db/schema'
import { type TenantTables, tSchemaTables } from '@workspace/db/tenant'
import { fastifyPlugin } from 'fastify-plugin'

export const tenantDatabase = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const tenantId = request.headers['x-tenant']

      if (!tenantId || typeof tenantId !== 'string') {
        throw new UnauthorizedError({
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        })
      }

      const [tenant] = await db
        .select({
          schemaName: tenantSchemas.schemaName,
        })
        .from(tenantSchemas)
        .where(eq(tenantSchemas.id, tenantId))
        .limit(1)

      if (!tenant) {
        throw new UnauthorizedError({
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        })
      }

      request.internal = {
        tenantSchema: <T>(callback: (tables: TenantTables) => T | Promise<T>) =>
          tSchemaTables<T>(tenant.schemaName, callback),
      } as any
    })
  },
)
