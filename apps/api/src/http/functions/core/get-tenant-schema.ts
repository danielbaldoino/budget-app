import { BadRequestError } from '@/http/errors/bad-request-error'
import { db, orm } from '@workspace/db'
import { tenantSchemas, workspaces } from '@workspace/db/schema'

export async function getTenantSchema({
  workspaceOwnerId,
}: {
  workspaceOwnerId: string
}) {
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
      code: 'TENANT_SCHEMA_NOT_FOUND',
      message: 'Tenant schema not found for workspace',
    })
  }

  const tenant = await db.query.tenantSchemas.findFirst({
    columns: { schemaName: true },
    where: orm.eq(tenantSchemas.id, workspace.tenantSchemaId),
  })

  if (!tenant) {
    throw new BadRequestError({
      code: 'TENANT_SCHEMA_NOT_FOUND',
      message: 'Tenant schema not found for workspace',
    })
  }

  return tenant.schemaName
}
