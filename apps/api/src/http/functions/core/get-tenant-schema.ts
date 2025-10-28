import { BadRequestError } from '@/http/errors/bad-request-error'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { tenantSchemas, workspaces } from '@workspace/db/schema'

export async function getTenantSchema({
  workspaceOwnerId,
}: {
  workspaceOwnerId: string
}) {
  const [workspace] = await db
    .select({
      tenantSchemaId: workspaces.tenantSchemaId,
    })
    .from(workspaces)
    .where(eq(workspaces.ownerId, workspaceOwnerId))
    .limit(1)

  if (!workspace) {
    throw new BadRequestError({
      code: 'WORKSPACE_NOT_FOUND',
      message: 'Workspace not found',
    })
  }

  if (!workspace.tenantSchemaId) {
    throw new BadRequestError({
      code: 'TENANT_SCHEMA_NOT_FOUND',
      message: 'Tenant schema not found for workspace',
    })
  }

  const [tenant] = await db
    .select({
      schemaName: tenantSchemas.schemaName,
    })
    .from(tenantSchemas)
    .where(eq(tenantSchemas.id, workspace.tenantSchemaId))
    .limit(1)

  if (!tenant) {
    throw new BadRequestError({
      code: 'TENANT_SCHEMA_NOT_FOUND',
      message: 'Tenant schema not found for workspace',
    })
  }

  return tenant.schemaName
}
