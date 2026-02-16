import { BaseError } from '@/http/errors/base-error'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import {
  resolveTenantById,
  resolveTenantByWorkspaceSlug,
} from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { fastifyPlugin } from 'fastify-plugin'

const TENANT_HEADER = 'x-tenant'
const WORKSPACE_HEADER = 'x-workspace'

export const tenantContext = fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    app.addHook('preHandler', async (request) => {
      const tenantId = request.headers[TENANT_HEADER]
      const workspaceSlug = request.headers[WORKSPACE_HEADER]

      if (tenantId && typeof tenantId !== 'string') {
        throw new UnauthorizedError({
          code: 'INVALID_TENANT_HEADER',
          message: `Invalid tenant header (${TENANT_HEADER})`,
        })
      }

      if (workspaceSlug && typeof workspaceSlug !== 'string') {
        throw new UnauthorizedError({
          code: 'INVALID_WORKSPACE_HEADER',
          message: `Invalid workspace header (${WORKSPACE_HEADER})`,
        })
      }

      if ((!tenantId && !workspaceSlug) || (tenantId && workspaceSlug)) {
        throw new UnauthorizedError({
          code: 'MISSING_TENANT_OR_WORKSPACE_HEADER',
          message: `Either tenant (${TENANT_HEADER}) or workspace (${WORKSPACE_HEADER}) header must be provided, but not both`,
        })
      }

      try {
        const tenant = workspaceSlug
          ? await resolveTenantByWorkspaceSlug(workspaceSlug, {
              throwUnauthorized: true,
            })
          : tenantId
            ? await resolveTenantById(tenantId, {
                throwUnauthorized: true,
              })
            : null

        request.application = { tenant } as any
      } catch (error) {
        if (error instanceof BaseError) {
          throw error
        }

        throw new UnauthorizedError({
          code: 'TENANT_RESOLUTION_FAILED',
          message: 'Failed to resolve tenant',
        })
      }
    })
  },
)
