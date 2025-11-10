import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db, orm } from '@workspace/db'
import { tenantSchemas, workspaces } from '@workspace/db/schema'
import { migrateTenantSchema } from '@workspace/db/tenant'
import { createSlug } from '@workspace/utils'
import { z } from 'zod'

export async function createOwnedWorkspace(app: FastifyTypedInstance) {
  app.register(authenticate).post(
    '/owned-workspace',
    {
      schema: {
        tags: ['Owned Workspace'],
        description: 'Create a new owned workspace',
        operationId: 'createOwnedWorkspace',
        body: z.object({
          name: z.string(),
          slug: z.string().transform(createSlug).nullish(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              workspaceId: z.string().uuid(),
              tenantSchemaId: z.string().uuid(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const {
        user: { id: userId },
      } = request.authSession

      const ownedWorkspace = await db.query.workspaces.findFirst({
        where: orm.eq(workspaces.ownerId, userId),
      })

      if (ownedWorkspace) {
        throw new BadRequestError({
          code: 'USER_ALREADY_HAS_OWNED_WORKSPACE',
          message: 'User already has an owned workspace',
        })
      }

      const { name, slug } = request.body

      const slugWorkspace = slug ?? createSlug(name)

      const workspaceBySlug = await db.query.workspaces.findFirst({
        where: orm.eq(workspaces.slug, slugWorkspace),
      })

      if (workspaceBySlug) {
        throw new BadRequestError({
          code: 'WORKSPACE_SLUG_ALREADY_IN_USE',
          message: 'This workspace slug is already in use',
        })
      }

      const { workspace, tenant } = await db.transaction(async (tx) => {
        const [workspace] = await tx
          .insert(workspaces)
          .values({
            name,
            slug: slugWorkspace,
            ownerId: userId,
          })
          .returning({
            id: workspaces.id,
          })

        if (!workspace) {
          throw new BadRequestError({
            code: 'WORKSPACE_CREATION_FAILED',
            message: 'Failed to create workspace',
          })
        }

        const [tenant] = await tx
          .insert(tenantSchemas)
          .values({
            schemaName: `tenant_${workspace.id}`,
          })
          .returning({
            id: tenantSchemas.id,
            schemaName: tenantSchemas.schemaName,
          })

        if (!tenant) {
          throw new BadRequestError({
            code: 'TENANT_SCHEMA_CREATION_FAILED',
            message: 'Failed to create tenant schema',
          })
        }

        // Run migrations for tenant schema
        await migrateTenantSchema(tenant.schemaName)

        await tx
          .update(workspaces)
          .set({
            tenantSchemaId: tenant.id,
          })
          .where(orm.eq(workspaces.id, workspace.id))

        return { workspace, tenant }
      })

      return reply.status(201).send({
        workspaceId: workspace.id,
        tenantSchemaId: tenant.id,
      })
    },
  )
}
