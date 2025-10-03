import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { tenantSchemas, workspaces } from '@workspace/db/schema'
import { migrateTenantSchema, tenantSchemaTables } from '@workspace/db/tenant'
import { createSlug } from '@workspace/utils'
import { hash } from 'bcryptjs'
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
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { user } = request.authSession

      const [ownedWorkspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerId, user.id))
        .limit(1)

      if (ownedWorkspace) {
        throw new BadRequestError({
          code: 'USER_ALREADY_HAS_OWNED_WORKSPACE',
          message: 'User already has an owned workspace',
        })
      }

      const { name, slug } = request.body

      const slugWorkspace = slug ?? createSlug(name)

      const [workspaceBySlug] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, slugWorkspace))
        .limit(1)

      if (workspaceBySlug) {
        throw new BadRequestError({
          code: 'WORKSPACE_SLUG_ALREADY_IN_USE',
          message: 'This workspace slug is already in use',
        })
      }

      const { workspace, tenantSchema } = await db.transaction(async (tx) => {
        const [workspace] = await tx
          .insert(workspaces)
          .values({
            name,
            slug: slugWorkspace,
            ownerId: user.id,
          })
          .returning()

        if (!workspace) {
          throw new BadRequestError({
            code: 'WORKSPACE_CREATION_FAILED',
            message: 'Failed to create workspace',
          })
        }

        const [tenantSchema] = await tx
          .insert(tenantSchemas)
          .values({
            schemaName: `tenant_${workspace.id}`,
          })
          .returning()

        if (!tenantSchema) {
          throw new BadRequestError({
            code: 'TENANT_SCHEMA_CREATION_FAILED',
            message: 'Failed to create tenant schema',
          })
        }

        await migrateTenantSchema(tenantSchema.schemaName)

        await tx
          .update(workspaces)
          .set({
            tenantSchemaId: tenantSchema.id,
          })
          .where(eq(workspaces.id, workspace.id))

        return { workspace, tenantSchema }
      })

      // TODO: Improve password generation
      const randomPassword = Math.random().toString(36).substring(2, 15)
      const passwordHash = await hash(randomPassword, 6)

      const [userCreated] = await tenantSchemaTables(
        tenantSchema.schemaName,
        async ({ users }) =>
          await db
            .insert(users)
            .values({
              name: 'Admin',
              username: 'admin',
              password: passwordHash,
            })
            .returning(),
      )

      // TODO: Send email to user with login credentials

      console.log('Send credentials to user:', {
        email: user.email,
        userCreated: userCreated
          ? {
              username: userCreated.username,
              password: userCreated.password,
            }
          : null,
      })

      return reply.status(201).send({
        workspaceId: workspace.id,
      })
    },
  )
}
