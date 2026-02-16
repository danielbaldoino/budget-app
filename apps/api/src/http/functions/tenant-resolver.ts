import { BadRequestError } from '@/http/errors/bad-request-error'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { db, orm } from '@workspace/db'
import { tenantSchemas, workspaces } from '@workspace/db/schema'
import {
  type TenantDatabase,
  type TenantSchemaCallback,
  tenantDb,
  tenantSchema,
} from '@workspace/db/tenant'
import { queries } from '@workspace/db/tenant/queries'

export interface TenantContext {
  name: string
  schema: <T>(cb: TenantSchemaCallback<T>) => T | Promise<T>
  db: TenantDatabase
  queries: typeof queries
}

interface ResolveTenantOptions {
  throwUnauthorized?: boolean
}

/**
 * Resolves tenant information from a tenant schema ID
 */
async function getTenantBySchemaId(
  tenantSchemaId: string,
  options: ResolveTenantOptions = {},
): Promise<TenantContext> {
  const tenant = await db.query.tenantSchemas.findFirst({
    columns: { schemaName: true },
    where: orm.eq(tenantSchemas.id, tenantSchemaId),
  })

  if (!tenant) {
    const ErrorClass = options.throwUnauthorized
      ? UnauthorizedError
      : BadRequestError
    throw new ErrorClass({
      code: 'TENANT_NOT_FOUND',
      message: 'Tenant not found',
    })
  }

  return {
    name: tenant.schemaName,
    schema: <T>(cb: TenantSchemaCallback<T>) =>
      tenantSchema<T>(tenant.schemaName, cb),
    db: tenantDb(tenant.schemaName),
    queries: queries,
  }
}

/**
 * Resolves tenant from a workspace slug
 */
export async function resolveTenantByWorkspaceSlug(
  workspaceSlug: string,
  options: ResolveTenantOptions = {},
): Promise<TenantContext> {
  const workspace = await db.query.workspaces.findFirst({
    columns: { tenantSchemaId: true },
    where: orm.eq(workspaces.slug, workspaceSlug),
  })

  const ErrorClass = options.throwUnauthorized
    ? UnauthorizedError
    : BadRequestError

  if (!workspace) {
    throw new ErrorClass({
      code: 'WORKSPACE_NOT_FOUND',
      message: 'Workspace not found',
    })
  }

  if (!workspace.tenantSchemaId) {
    throw new ErrorClass({
      code: 'TENANT_SCHEMA_NOT_ASSIGNED',
      message: 'Tenant schema not assigned to workspace',
    })
  }

  return getTenantBySchemaId(workspace.tenantSchemaId, options)
}

/**
 * Resolves tenant from a workspace owner ID
 */
export async function resolveTenantByWorkspaceOwner(
  workspaceOwnerId: string,
): Promise<TenantContext> {
  const workspace = await db.query.workspaces.findFirst({
    columns: { tenantSchemaId: true },
    where: orm.eq(workspaces.ownerId, workspaceOwnerId),
  })

  if (!workspace) {
    throw new BadRequestError({
      code: 'WORKSPACE_NOT_FOUND',
      message: 'Workspace not found',
    })
  }

  if (!workspace.tenantSchemaId) {
    throw new BadRequestError({
      code: 'TENANT_SCHEMA_NOT_ASSIGNED',
      message: 'Tenant schema not assigned to workspace',
    })
  }

  return getTenantBySchemaId(workspace.tenantSchemaId)
}

/**
 * Resolves tenant directly from tenant schema ID
 */
export async function resolveTenantById(
  tenantSchemaId: string,
  options: ResolveTenantOptions = {},
): Promise<TenantContext> {
  return getTenantBySchemaId(tenantSchemaId, options)
}
