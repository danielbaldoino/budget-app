import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import {
  resolveTenantById,
  resolveTenantByWorkspaceSlug,
} from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { fastifyPlugin } from 'fastify-plugin'

export const tenantContext = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const tenantId = request.headers['x-tenant']
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
            'Either tenant (x-tenant) or workspace (x-workspace) header must be provided, but not both',
        })
      }

      const tenant = workspaceSlug
        ? await resolveTenantByWorkspaceSlug(workspaceSlug, {
            throwUnauthorized: true,
          })
        : await resolveTenantById(tenantId!, { throwUnauthorized: true })

      request.application = { tenant } as any
    })
  },
)
