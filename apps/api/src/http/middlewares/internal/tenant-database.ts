import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db, orm } from '@workspace/db'
import { tenantSchemas, workspaces } from '@workspace/db/schema'
import {
  type TenantSchemaCallback,
  tenantDb,
  tenantSchema,
} from '@workspace/db/tenant'
import { fastifyPlugin } from 'fastify-plugin'

export const tenantDatabase = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      let tenantId = request.headers['x-tenant']
      const workspaceSlug = request.headers['x-workspace']

      if (tenantId && typeof tenantId !== 'string') {
        throw new UnauthorizedError({
          code: 'INVALID_TENANT_HEADER',
          message: 'Invalid tenant header (x-tenant)',
        })
      }

      if (workspaceSlug && typeof workspaceSlug !== 'string') {
        throw new UnauthorizedError({
          code: 'INVALID_WORKSPACE_HEADER',
          message: 'Invalid workspace header (x-workspace)',
        })
      }

      if ((!tenantId && !workspaceSlug) || (tenantId && workspaceSlug)) {
        throw new UnauthorizedError({
          code: 'MISSING_TENANT_OR_WORKSPACE_HEADER',
          message:
            'Either tenant header (x-tenant) or workspace header (x-workspace) must be provided',
        })
      }

      if (workspaceSlug) {
        const workspace = await db.query.workspaces.findFirst({
          columns: { tenantSchemaId: true },
          where: orm.eq(workspaces.slug, workspaceSlug),
        })

        if (!workspace) {
          throw new UnauthorizedError({
            code: 'WORKSPACE_NOT_FOUND',
            message: 'Workspace not found',
          })
        }

        if (!workspace.tenantSchemaId) {
          throw new UnauthorizedError({
            code: 'WORKSPACE_TENANT_NOT_FOUND',
            message: 'Workspace tenant not found',
          })
        }

        tenantId = workspace.tenantSchemaId
      }

      const tenant = await db.query.tenantSchemas.findFirst({
        columns: { schemaName: true },
        where: orm.eq(tenantSchemas.id, tenantId as string),
      })

      if (!tenant) {
        throw new UnauthorizedError({
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        })
      }

      request.internal = {
        tenantSchema: <T>(cb: TenantSchemaCallback<T>) =>
          tenantSchema<T>(tenant.schemaName, cb),
        tenantDb: tenantDb(tenant.schemaName),
      } as any
    })
  },
)
